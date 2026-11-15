import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCouponDto } from './dto/create-coupon.dto.js';
import { UpdateCouponDto } from './dto/update-coupon.dto.js';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Coupon, HCouponDocument } from '../DB/models/coupon.model.js';

@Injectable()
export class CouponService {
  constructor(
    @InjectModel(Coupon.name)
    private readonly _couponModel: Model<HCouponDocument>,
  ) {}

  async create(createCouponDto: CreateCouponDto, adminId: Types.ObjectId) {
    const cleanCode = createCouponDto.code.toUpperCase().trim();

    const existing = await this._couponModel.exists({ code: cleanCode });

    if (existing)
      throw new ConflictException('A coupon with this code already exists');

    const newCoupon = new this._couponModel({
      ...createCouponDto,
      code: cleanCode,
      createdBy: adminId,
    });

    return (await newCoupon.save()).populate('createdBy', 'email -_id');
  }

  async validate(code: string, userId: string) {
    const coupon = await this._couponModel.findOne({
      code: code.toUpperCase().trim(),
    });
    if (!coupon)
      throw new NotFoundException('Oops! Coupon is invalid or expired');

    if (new Date() > coupon.expiryDate)
      throw new BadRequestException('Oops! Coupon is invalid or expired');

    if (coupon.usedCount >= coupon.maxUsage)
      throw new BadRequestException('Oops! Coupon is invalid or expired');

    const hasUsed = coupon.usedBy
      .map((id) => id.toString())
      .includes(userId);
    if (hasUsed)
      throw new BadRequestException('Oops! Coupon is invalid or expired');

    return coupon;
  }

  findAll() {
    return this._couponModel.find().populate('createdBy', 'email -_id');
  }

  findOne(id: number) {
    return `This action returns a #${id} coupon`;
  }

  async update(id: Types.ObjectId, updateCouponDto: UpdateCouponDto) {
    const updated = await this._couponModel.findByIdAndUpdate(
      id,
      updateCouponDto,
      { returnDocument: 'after' },
    );
    if (!updated) throw new NotFoundException('Coupon not found');

    return updated;
  }

  remove(id: number) {
    return `This action removes a #${id} coupon`;
  }
}
