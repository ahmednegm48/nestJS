import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateBrandDto } from './dto/create-brand.dto.js';
import { UpdateBrandDto } from './dto/update-brand.dto.js';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Brand, HBrandDocument } from '../DB/models/brand.model.js';
import { Category, HCategoryDocument } from '../DB/models/category.model.js';

@Injectable()
export class BrandService {
  constructor(
    @InjectModel(Brand.name)
    private readonly _brandModel: Model<HBrandDocument>,
    @InjectModel(Category.name)
    private readonly _categoryModel: Model<HCategoryDocument>,
  ) {}

  async create(
    createBrandDto: CreateBrandDto,
    logoUrl: string,
    adminId: Types.ObjectId,
  ) {
    const existingCategoriesCount = await this._categoryModel.countDocuments({
      _id: { $in: createBrandDto.categories },
    });
    if (existingCategoriesCount !== createBrandDto.categories.length)
      throw new BadRequestException('one or more category do not exists ');

    const newBrand = new this._brandModel({
      ...createBrandDto,
      logo: logoUrl,
      createdBy: adminId,
    });
    return (await newBrand.save()).populate('categories', 'name logo');
  }

  async findAll(): Promise<HBrandDocument[]> {
    const brands = await this._brandModel
      .find()
      .populate('categories', 'name logo');
    if (!brands) throw new NotFoundException('No brands found');
    return brands;
  }

  async findOne(id: Types.ObjectId): Promise<HBrandDocument> {
    const brand = await this._brandModel
      .findById(id)
      .populate('categories', 'name logo');
    if (!brand) throw new NotFoundException('Brand not found');
    return brand;
  }

  async update(
    id: Types.ObjectId,
    updateBrandDto: UpdateBrandDto,
    logoUrl?: string,
  ) {
    if (updateBrandDto.categories) {
      const existingCategoriesCount = await this._categoryModel.countDocuments({
        _id: { $in: updateBrandDto.categories },
      });
      if (existingCategoriesCount !== updateBrandDto.categories?.length)
        throw new BadRequestException('one or more category do not exists ');
    }
    const updatedData: any = { ...updateBrandDto };
    if (logoUrl) updatedData.logo = logoUrl;
    const updatedBrand = await this._brandModel
      .findByIdAndUpdate(id, updatedData, { returnDocument: 'after' })
      .populate('categories', 'name logo');
    if (!updatedBrand) throw new NotFoundException('Brand not found');
    return updatedBrand;
  }
}
