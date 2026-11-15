import { MongooseModule, Prop, SchemaFactory, Schema } from '@nestjs/mongoose';
import { HydratedDocument, Types, Schema as MongooseSchema } from 'mongoose';
import { Field, ID, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
@Schema({
  timestamps: true,
})
export class Coupon {
  @Field(() => ID)
  _id: Types.ObjectId;

  @Field(() => String)
  @Prop({
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
  })
  code: string;

  @Field(() => Int)
  @Prop({
    type: Number,
    required: true,
    min: 1,
    max: 100,
  })
  discountPercentage: number;

  @Field(() => Date)
  @Prop({
    type: Date,
    required: true,
  })
  expiryDate: Date;

  @Field(() => Int)
  @Prop({
    type: Number,
    required: true,
    min: 1,
    default: 100,
  })
  maxUsage: number;

  @Field(() => Int)
  @Prop({
    type: Number,
    default: 0,
    min: 0,
  })
  usedCount: number;

  @Field(() => [ID])
  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId }],
    default: [],
  })
  usedBy: Types.ObjectId[];

  @Field(() => ID)
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    required: true,
    ref: 'User',
  })
  createdBy: Types.ObjectId;
}

export const couponSchema = SchemaFactory.createForClass(Coupon);

export type HCouponDocument = HydratedDocument<Coupon>;
export const CouponModel = MongooseModule.forFeature([
  { name: Coupon.name, schema: couponSchema },
]);
