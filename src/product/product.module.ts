import { Module } from '@nestjs/common';
import { ProductService } from './product.service.js';
import { ProductController } from './product.controller.js';
import { UserModel } from '../DB/models/user.model.js';
import { BrandModel } from '../DB/models/brand.model.js';
import { ProductModel } from '../DB/models/product.model.js';
import { TokenService } from '../common/services/token.service.js';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [UserModel, BrandModel, ProductModel],
  controllers: [ProductController],
  providers: [ProductService, TokenService, JwtService],
})
export class ProductModule {}
