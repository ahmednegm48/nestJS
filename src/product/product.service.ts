import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { HProductDocument, Product } from '../DB/models/product.model.js';
import { Category, HCategoryDocument } from '../DB/models/category.model.js';
import { Brand, HBrandDocument } from '../DB/models/brand.model.js';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name)
    private readonly _productModel: Model<HProductDocument>,
    @InjectModel(Brand.name)
    private readonly _brandModel: Model<HBrandDocument>,
  ) {}

  private async checkBrandCategoryRelation(
    brandId: string,
    categoryId: string,
  ): Promise<void> {
    const brand = await this._brandModel.findById(brandId);
    if (!brand) throw new NotFoundException('Brand not found');
    const categoryExists = brand.categories.some(
      (catId) => catId.toString() === categoryId,
    );
    if (!categoryExists)
      throw new BadRequestException(
        'The specified category is not associated with the given brand.',
      );
  }

  async create(
    createProductDto: CreateProductDto,
    imageUrl: string[],
    adminId: Types.ObjectId,
  ) {
    await this.checkBrandCategoryRelation(
      createProductDto.brand,
      createProductDto.category,
    );

    const newProduct = new this._productModel({
      ...createProductDto,
      images: imageUrl,
      createdBy: adminId,
    });
    return (await newProduct.save()).populate(
      'brand category createdBy',
      '-password',
    );
  }

  async findAll(): Promise<HProductDocument[]> {
    const products = await this._productModel
      .find()
      .populate('brand category createdBy', '-password');
    if (!products) throw new NotFoundException('No products found');
    return products;
  }

  async findOne(id: Types.ObjectId): Promise<HProductDocument> {
    const product = await this._productModel
      .findById(id)
      .populate('brand category createdBy', '-password');
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async update(
    id: Types.ObjectId,
    updateProductDto: UpdateProductDto,
    imageUrl?: string[],
  ) {
    if (updateProductDto.brand && updateProductDto.category)
      await this.checkBrandCategoryRelation(
        updateProductDto.brand,
        updateProductDto.category,
      );
    const updatedData: any = { ...UpdateProductDto };
    if (imageUrl) updatedData.images = imageUrl;
    const updatedProduct = await this._productModel
      .findByIdAndUpdate(id, updatedData, { returnDocument: 'after' })
      .populate('brand category createdBy', '-password');
    if (!updatedProduct) throw new NotFoundException('Product not found');
    return updatedProduct;
  }
}
