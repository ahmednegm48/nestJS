import { MongooseModule, Prop, SchemaFactory, Schema } from '@nestjs/mongoose';
import { HydratedDocument, Types, Schema as MongooseSchema } from 'mongoose';
import { OrderStatusEnum } from '../../common/enums/order.enum.js';

@Schema({ _id: false })
export class OrderItem {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Product', required: true })
  product: Types.ObjectId;

  @Prop({ type: Number, required: true })
  quantity: number;

  @Prop({ type: Number, required: true })
  priceSnapshot: number;
}

@Schema({
  timestamps: true,
})
export class Order {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({
    type: [OrderItem],
    required: true,
  })
  items: OrderItem[];

  @Prop({ required: true, type: Number })
  subTotal: number;

  @Prop({ type: Number, default: 0 })
  discountAmount: number;

  @Prop({ type: Number, required: true })
  finalTotal: number;

  @Prop({
    type: String,
    required: true,
    enum: Object.values(OrderStatusEnum),
    default: OrderStatusEnum.PENDING,
  })
  status: string;

  @Prop({ type: String, required: true })
  shippingAddress: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Coupon' })
  appliedCoupon?: Types.ObjectId;
}

export const orderSchema = SchemaFactory.createForClass(Order);

export type HOrderDocument = HydratedDocument<Order>;
export const OrderModel = MongooseModule.forFeature([
  { name: Order.name, schema: orderSchema },
]);
