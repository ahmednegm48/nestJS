import { IsInt, IsMongoId, IsNotEmpty, Min } from 'class-validator';

export class AddToCartDto {
  @IsMongoId({
    message: 'Invalid product ID format',
  })
  @IsNotEmpty()
  productId: string;

  @IsInt()
  @IsNotEmpty()
  @Min(1)
  quantity: number;
}
