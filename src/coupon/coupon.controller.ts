import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CouponService } from './coupon.service.js';
import { CreateCouponDto } from './dto/create-coupon.dto.js';
import { UpdateCouponDto } from './dto/update-coupon.dto.js';
import { AuthGuard } from '../common/guards/auth.guard.js';
import type { Request } from 'express';
import { Types } from 'mongoose';

@Controller('coupon')
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @Post()
  @UseGuards(AuthGuard)
  create(@Body() createCouponDto: CreateCouponDto, @Req() req: Request) {
    const adminId = req.user?._id as unknown as Types.ObjectId;
    return this.couponService.create(createCouponDto, adminId);
  }

  @Post('validate')
  @UseGuards(AuthGuard)
  async validate(@Body('code') code: string, @Req() req: Request) {
    const userId = req.user?._id.toString() as string;
    return this.couponService.validate(code, userId);
  }

  @Get()
  @UseGuards(AuthGuard)
  findAll() {
    return this.couponService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.couponService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  update(
    @Param('id') id: Types.ObjectId,
    @Body() updateCouponDto: UpdateCouponDto,
  ) {
    return this.couponService.update(id, updateCouponDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.couponService.remove(+id);
  }
}
