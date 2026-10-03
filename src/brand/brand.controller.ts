import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Req,
} from '@nestjs/common';
import { BrandService } from './brand.service.js';
import { CreateBrandDto } from './dto/create-brand.dto.js';
import { UpdateBrandDto } from './dto/update-brand.dto.js';
import { RoleEnum } from '../common/enums/user.enum.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerOptions } from '../common/utils/multer.util.js';
import { Types } from 'mongoose';
import type { Request } from 'express';
import { AuthGuard } from '../common/guards/auth.guard.js';

@Controller('brand')
@UseGuards(AuthGuard)
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @Post()
  @Roles(RoleEnum.ADMIN)
  @UseGuards(RolesGuard)
  @UseInterceptors(FileInterceptor('logo', multerOptions))
  create(
    @UploadedFile() file: Express.Multer.File,
    @Body() createBrandDto: CreateBrandDto,
    @Req() req: Request,
  ) {
    if (!file) throw new BadRequestException('brand logo is required');
    const logoUrl = `http://127.0.0.1:3000/${file.path.replace(/\\/g, '/')}`;
    const adminId = req.user?._id as unknown as Types.ObjectId;

    return this.brandService.create(createBrandDto, logoUrl, adminId);
  }

  @Get()
  findAll() {
    return this.brandService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: Types.ObjectId) {
    return this.brandService.findOne(id);
  }

  @Patch(':id')
  @Roles(RoleEnum.ADMIN)
  @UseGuards(RolesGuard)
  @UseInterceptors(FileInterceptor('logo', multerOptions))
  update(
    @UploadedFile() file: Express.Multer.File,
    @Param('id') id: Types.ObjectId,
    @Body() updateBrandDto: UpdateBrandDto,
  ) {
    let logoUrl: string | undefined;
    if (file)
      logoUrl = `http://127.0.0.1:3000/${file.path.replace(/\\/g, '/')}`;
    return this.brandService.update(id, updateBrandDto, logoUrl);
  }
}
