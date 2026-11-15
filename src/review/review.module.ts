import { Module } from '@nestjs/common';
import { ReviewService } from './review.service.js';
import { ReviewController } from './review.controller.js';
import { UserModel } from '../DB/models/user.model.js';
import { ProductModel } from '../DB/models/product.model.js';
import { ReviewModel } from '../DB/models/review.model.js';
import { TokenService } from '../common/services/token.service.js';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports:[UserModel, ProductModel, ReviewModel],
  controllers: [ReviewController],
  providers: [ReviewService,TokenService,JwtService],
})
export class ReviewModule {}
