import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';
import { InjectModel } from '@nestjs/mongoose';
import { Category, HCategoryDocument } from '../DB/models/category.model.js';
import { Model, Types } from 'mongoose';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name)
    private readonly _categoryModel: Model<HCategoryDocument>,
  ) {}

  create(createCategoryDto: CreateCategoryDto, logoUrl: string, adminId: Types.ObjectId) {
    const newCategory = new this._categoryModel({
      ...createCategoryDto,
      logo: logoUrl,
      createdBy: adminId,
    });
    return newCategory.save();
  }


  findAll() {
    return this._categoryModel.find();
  }

  findOne(id: string) {
    return this._categoryModel.findById(id);
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto , logoUrl?: string) {
    const updatedData: any = {...updateCategoryDto};
    if(logoUrl) updatedData.logo =  logoUrl;
    const updatedCategory = await this._categoryModel.findByIdAndUpdate(id, updatedData, { returnDocument: 'after' }).populate('createdBy','firstName lastName email');
    return updatedCategory;
  }
}
