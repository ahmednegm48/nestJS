import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  UploadedFile,
  Req,
  BadRequestException,
  UseInterceptors,
} from '@nestjs/common';
import { CategoryService } from './category.service.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';
import { RoleEnum } from '../common/enums/user.enum.js';
import { AuthGuard } from '../common/guards/auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import type { Request } from 'express';
import { Types } from 'mongoose';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerOptions } from '../common/utils/multer.util.js';

@Controller('category')
@UseGuards(AuthGuard)
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @Roles(RoleEnum.ADMIN)
  @UseGuards(RolesGuard)
  @UseInterceptors(FileInterceptor('logo', multerOptions))
  create(
    @UploadedFile() file: Express.Multer.File,
    @Body() createCategoryDto: CreateCategoryDto,
    @Req() req: Request,
  ) {
    if (!file) throw new BadRequestException('category logo is required');
    const logoUrl = `http://127.0.0.1:3000/${file.path.replace(/\\/g, '/')}`;
    const adminId = req.user?._id as unknown as Types.ObjectId;

    return this.categoryService.create(createCategoryDto, logoUrl, adminId);
  }

  @Get()
  findAll() {
    return this.categoryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoryService.findOne(id);
  }

  @Patch(':id')
  @Roles(RoleEnum.ADMIN)
  @UseGuards(RolesGuard)
  @UseInterceptors(FileInterceptor('logo', multerOptions))
  update(
    @UploadedFile() file: Express.Multer.File,
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    let logoUrl: string | undefined;
    if (file)
      logoUrl = `http://127.0.0.1:3000/${file.path.replace(/\\/g, '/')}`;
    return this.categoryService.update(id, updateCategoryDto, logoUrl);
  }
}
