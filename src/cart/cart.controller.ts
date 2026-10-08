import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  Patch,
} from '@nestjs/common';
import { CartService } from './cart.service.js';
import { AuthGuard } from '../common/guards/auth.guard.js';
import type { Request } from 'express';
import { AddToCartDto } from './dto/create-cart.dto.js';
import { Types } from 'mongoose';

@Controller('cart')
@UseGuards(AuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post('add')
  async addToCart(@Body() addToCartDto: AddToCartDto, @Req() req: Request) {
    const userId = req.user?.id as unknown as Types.ObjectId;
    return this.cartService.addToCart(userId, addToCartDto);
  }

  @Get()
  findOne(@Req() req: Request) {
    const userId = req.user?.id as unknown as Types.ObjectId;
    return this.cartService.getCart(userId);
  }

  @Patch('remove/:productId')
  removeItem(@Param('productId') productId: string, @Req() req: Request) {
    const userId = req.user?.id as unknown as Types.ObjectId;
    return this.cartService.removeItem(userId, productId);
  }
}
