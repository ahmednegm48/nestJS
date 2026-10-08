import { MongooseModule, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types, Schema as MongooseSchema } from 'mongoose';


@Schema({
    _id:false,
})
export class CartItem {
    @Prop({
        type: MongooseSchema.Types.ObjectId,
        required: true,
        ref: 'Product',
    })
    product: string;

    @Prop({
        type: Number,
        required: true,
        min: 1,
    })
    quantity: number;

    @Prop({
        type:Number,
        required:true,
        min:1,
    })
    pricePerUnit:number;

    @Prop({
        type:Number,
        required:true,
        min:1,
    })
    subTotal:number;
}

@Schema({
    timestamps:true,
})
export class Cart {
    @Prop({
        type: MongooseSchema.Types.ObjectId,
        required: true,
        ref: 'User',
    })
    user: Types.ObjectId;

    @Prop({
        type: [CartItem],
        default: [],
    })
    items: CartItem[];

    @Prop({
        type:Number,
        required:true,
        min:0,
    })
    totalPrice: number;
}

export const CartSchema = SchemaFactory.createForClass(Cart);

export type HCartDocument = HydratedDocument<Cart>;
export const CartModel = MongooseModule.forFeature([
  { name: Cart.name, schema: CartSchema },
]);