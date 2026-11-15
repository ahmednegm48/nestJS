import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class CreateCouponInput {
  @Field(() => String)
  code: string;

  @Field(() => Int)
  discountPercentage: number;

  @Field(() => Date)
  expiryDate: Date;

  @Field(() => Int)
  maxUsage: number;
}
