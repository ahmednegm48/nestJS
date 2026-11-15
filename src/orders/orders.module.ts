import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service.js';
import { OrdersController } from './orders.controller.js';
import { UserModel } from '../DB/models/user.model.js';
import { ProductModel } from '../DB/models/product.model.js';
import { CartModel } from '../DB/models/cart.model.js';
import { CouponModel } from '../DB/models/coupon.model.js';
import { OrderModel } from '../DB/models/order.model.js';
import { TokenService } from '../common/services/token.service.js';
import { JwtService } from '@nestjs/jwt';
import { SocketModule } from '../socket/socket.module.js';

@Module({
  imports: [
    UserModel,
    ProductModel,
    CartModel,
    CouponModel,
    OrderModel,
    SocketModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService, TokenService, JwtService],
})
export class OrdersModule {}
