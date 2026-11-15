import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import type { Request } from 'express';
import { Types } from 'mongoose';
import { AuthGuard } from '../common/guards/auth.guard.js';

@Controller('orders')
@UseGuards(AuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('checkout')
  createOrder(@Body() createOrderDto: CreateOrderDto, @Req() req: Request) {
    const userId = req.user?._id as Types.ObjectId;

    return this.ordersService.createOrder(createOrderDto, userId);
  }
}
