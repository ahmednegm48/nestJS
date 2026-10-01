import { Module } from '@nestjs/common';
import { CategoryService } from './category.service.js';
import { CategoryController } from './category.controller.js';
import { CategoryModel } from '../DB/models/category.model.js';
import { TokenService } from '../common/services/token.service.js';
import { JwtService } from '@nestjs/jwt';
import { UserModel } from '../DB/models/user.model.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports:[CategoryModel,UserModel,AuthModule],
  controllers: [CategoryController],
  providers: [CategoryService, TokenService , JwtService],
})
export class CategoryModule {}
