import {
  IsDate,
  IsInt,
  IsNotEmpty,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCouponDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsInt()
  @Min(1)
  @Max(100)
  discountPercentage: number;

  @IsInt()
  @Min(1)
  maxUsage: number;

  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  expiryDate: Date;
}
