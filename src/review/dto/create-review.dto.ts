import {
  IsMongoId,
  IsNotEmpty,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';

export class CreateReviewDto {
  @IsMongoId({ message: 'Invlaid Product reference ID' })
  @IsNotEmpty({ message: 'Product ID is required' })
  product: string;

  @Min(1, { message: 'rating must be at least 1' })
  @Max(5, { message: 'ratinh must be at most 5' })
  rating: number;

  @IsString()
  @IsNotEmpty({ message: 'comment ID is required' })
  @Length(3, 500)
  comment: string;
}