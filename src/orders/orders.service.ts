import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { Cart } from '../DB/models/cart.model.js';
import { HOrderDocument, Order } from '../DB/models/order.model.js';
import { HProductDocument, Product } from '../DB/models/product.model.js';
import { Coupon, HCouponDocument } from '../DB/models/coupon.model.js';
import { SocketService } from '../socket/socket.service.js';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name)
    private readonly _orderModel: Model<HOrderDocument>,
    @InjectModel(Cart.name)
    private readonly _cartModel: Model<Cart>,
    @InjectModel(Product.name)
    private readonly _productModel: Model<HProductDocument>,
    @InjectModel(Coupon.name)
    private readonly _couponModel: Model<HCouponDocument>,
    private readonly _socketService: SocketService,
  ) {}

  async createOrder(createOrderDto: CreateOrderDto, userId: Types.ObjectId) {
    // 1- Fetch user cart
    const cart = await this._cartModel.findOne({ user: userId });
    if (!cart || cart.items.length === 0)
      throw new BadRequestException(
        'Your checkout pipline failed: cart is currently empty',
      );

    const orderItems: any[] = [];
    let calculatedSubTotal = 0;

    for (const item of cart.items) {
      const dbProduct = await this._productModel.findById(item.product);
      if (!dbProduct)
        throw new NotFoundException(
          'Checkout aborted. Product ID no longer exists',
        );

      if (dbProduct.stock < item.quantity)
        throw new BadRequestException(
          `Insufficient stock. Only ${dbProduct.stock} units available`,
        );

      calculatedSubTotal += dbProduct.price * item.quantity;

      orderItems.push({
        product: item.product,
        quantity: item.quantity,
        priceSnapshot: dbProduct.price,
      });
    }

    let discountAmount = 0;
    let targetCoupon: HCouponDocument | null = null;

    if (createOrderDto.appliedCoupon) {
      targetCoupon = await this._couponModel.findOne({
        code: createOrderDto.appliedCoupon.toUpperCase().trim(),
      });
      if (!targetCoupon)
        throw new NotFoundException('Oops! Coupon is invalid or expired');

      if (new Date() > targetCoupon.expiryDate)
        throw new BadRequestException('Oops! Coupon is invalid or expired');

      if (targetCoupon.usedCount >= targetCoupon.maxUsage)
        throw new BadRequestException('Oops! Coupon is invalid or expired');

      discountAmount =
        (calculatedSubTotal * targetCoupon.discountPercentage) / 100;
    }

    const finalTotal = calculatedSubTotal - discountAmount;

    // update stock
    for (const item of orderItems) {
      const updatedProducts = await this._productModel.findByIdAndUpdate(
        item.product,
        { $inc: { stock: -item.quantity } },
        { returnDocument: 'after' },
      );

      if (updatedProducts) {
        if (updatedProducts.stock <= 5 && updatedProducts.stock > 0) {
          this._socketService.emitToRoom(
            `product:${updatedProducts._id}`,
            'lowStockAlert',
            {
              productId: updatedProducts._id,
              productName: updatedProducts.name,
              currentStock: updatedProducts.stock,
              message: `Running low! Only ${updatedProducts.stock} left of ${updatedProducts.name}`,
            },
          );
        }
        if (updatedProducts.stock === 0) {
          this._socketService.emitToAll('productSoldOut', {
            productId: updatedProducts._id,
            productName: updatedProducts.name,
            message: `${updatedProducts.name} is now completely out of stock`,
          });
        }
      }
    }

    if (targetCoupon) {
      await this._couponModel.findByIdAndUpdate(targetCoupon._id, {
        $inc: { usedCount: 1 },
        $push: { usedBy: userId },
      });
    }

    const order = new this._orderModel({
      user: userId,
      items: orderItems,
      subTotal: calculatedSubTotal,
      discountAmount,
      finalTotal,
      shippingAddress: createOrderDto.shippingAddress,
      appliedCoupon: targetCoupon?._id,
    });

    return order.save();
  }
}
