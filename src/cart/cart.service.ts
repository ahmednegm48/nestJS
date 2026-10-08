import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AddToCartDto } from './dto/create-cart.dto.js';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Cart, HCartDocument } from '../DB/models/cart.model.js';
import { HProductDocument, Product } from '../DB/models/product.model.js';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private readonly _cartModel: Model<HCartDocument>,
    @InjectModel(Product.name)
    private readonly _productModel: Model<HProductDocument>,
  ) {}

  private recalculateCartTotal(cart: HCartDocument): void {
    let total = 0;
    for (const item of cart.items) {
      item.subTotal = item.pricePerUnit * item.quantity;
      total += item.subTotal;
    }
    cart.totalPrice = total;
  }

  async addToCart(
    userId: Types.ObjectId,
    addToCartDto: AddToCartDto,
  ): Promise<HCartDocument> {
    const { productId, quantity } = addToCartDto;
    const product = await this._productModel.findById(productId);
    if (!product) throw new NotFoundException('Product not found');
    if (product.stock < quantity)
      throw new BadRequestException(
        `Insufficient stock, available stock: ${product.stock}`,
      );
    let cart = await this._cartModel.findOne({ user: userId });
    if (!cart) {
      cart = new this._cartModel({
        user: userId,
        items: [],
      });
    }
    const existingItemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId,
    );
    if (existingItemIndex > -1) {
      const targetNewQuantity =
        cart.items[existingItemIndex].quantity + quantity;
      if (product.stock < targetNewQuantity)
        throw new BadRequestException(
          `Insufficient stock, available stock: ${product.stock}`,
        );
      cart.items[existingItemIndex].quantity = targetNewQuantity;
    } else {
      cart.items.push({
        product: productId,
        quantity,
        pricePerUnit: product.price,
        subTotal: product.price * quantity,
      });
    }
    this.recalculateCartTotal(cart);
    return (await cart.save()).populate('items.product');
  }

  async getCart(userId: Types.ObjectId): Promise<HCartDocument> {
    let cart = await this._cartModel
      .findOne({ user: userId })
      .populate('items.product');
    if (!cart) {
      cart = new this._cartModel({
        user: userId,
        items: [],
      });
      await cart.save();
    }
    return cart;
  }

  async removeItem(
    userId: Types.ObjectId,
    productId: string,
  ): Promise<HCartDocument> {
    let cart = await this._cartModel.findOne({ user: userId });
    if (!cart) throw new NotFoundException('Cart not found');
    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId,
    );
    this.recalculateCartTotal(cart);
    return (await cart.save()).populate('items.product');
  }
}
