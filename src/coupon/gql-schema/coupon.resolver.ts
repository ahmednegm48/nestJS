import {
  Args,
  Context,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Types } from 'mongoose';
import { Coupon } from '../../DB/models/coupon.model.js';
import { CouponService } from '../coupon.service.js';
import { CreateCouponInput } from './dto/create-coupon.input.js';
import { AuthGuard } from '../../common/guards/auth.guard.js';

@Resolver(() => Coupon)
export class CouponResolver {
  constructor(private readonly couponService: CouponService) {}

  // QUERY: Fetch all coupons
  @Query(() => [Coupon], { name: 'getCoupons' })
  async findAll() {
    return this.couponService.findAll();
  }

  // MUTATION: Create a coupon
  @Mutation(() => Coupon, { name: 'createCoupon' })
  @UseGuards(AuthGuard)
  async createCoupon(
    @Args('input') input: CreateCouponInput,
    @Context() context: any,
  ) {
    const adminId = context.req.user._id as Types.ObjectId;
    return this.couponService.create(input, adminId);
  }

  // createdBy is populated with the creator's email by the service
  @ResolveField('createdBy', () => String, { nullable: true })
  createdBy(@Parent() coupon: { createdBy?: unknown }) {
    const creator = coupon.createdBy as { email?: string } | undefined;
    if (creator && typeof creator === 'object' && 'email' in creator)
      return creator.email;
    return creator ? String(creator) : null;
  }
}
