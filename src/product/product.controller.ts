import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  UseInterceptors,
  Req,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { ProductService } from './product.service.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { AuthGuard } from '../common/guards/auth.guard.js';
import { FilesInterceptor } from '@nestjs/platform-express';
import { multerOptions } from '../common/utils/multer.util.js';
import type { Request } from 'express';
import { Types } from 'mongoose';
import { Roles } from '../common/decorators/roles.decorator.js';
import { RoleEnum } from '../common/enums/user.enum.js';
import { RolesGuard } from '../common/guards/roles.guard.js';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @Roles(RoleEnum.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  @UseInterceptors(FilesInterceptor('images', 10, multerOptions))
  create(
    @Body() createProductDto: CreateProductDto,
    @Req() req: Request,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (!files) throw new BadRequestException('product images are required');
    const imageUrl: string[] = files.map(
      (file) => `http://127.0.0.1:3000/${file.path.replace(/\\/g, '/')}`,
    );
    const adminId = req.user?._id as Types.ObjectId;
    return this.productService.create(createProductDto, imageUrl, adminId);
  }

  @Get()
  findAll() {
    return this.productService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: Types.ObjectId) {
    return this.productService.findOne(id);
  }

  @Patch(':id')
  @Roles(RoleEnum.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  @UseInterceptors(FilesInterceptor('images', 10, multerOptions))
  update(
    @Param('id') id: Types.ObjectId,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    const imageUrl: string[] = files?.map(
      (file) => `http://127.0.0.1:3000/${file.path.replace(/\\/g, '/')}`,
    ) || [];
    return this.productService.update(id, updateProductDto, imageUrl);
  }
}
