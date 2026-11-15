import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto.js';
import { UpdateReviewDto } from './dto/update-review.dto.js';
import { InjectModel } from '@nestjs/mongoose';
import { HReviewDocument, Review } from '../DB/models/review.model.js';
import { Model, Types } from 'mongoose';
import { HProductDocument, Product } from '../DB/models/product.model.js';

@Injectable()
export class ReviewService {
  constructor(
    @InjectModel(Review.name)
    private readonly _reviewModel: Model<HReviewDocument>,

    @InjectModel(Product.name)
    private readonly _productModel: Model<HProductDocument>,
  ) {}

  async create(createReviewDto: CreateReviewDto, userId: Types.ObjectId) {
    const product = await this._productModel.exists({
      _id: createReviewDto.product,
    });
    if (!product)
      throw new NotFoundException(
        'the product you want to review does not exists',
      );

    const alreadyReviewed = await this._reviewModel.exists({
      user: userId,
      product: createReviewDto.product,
    });
    if (alreadyReviewed)
      throw new ConflictException(
        'you have already submitted a review for this product. use update instead',
      );

    const newReview = new this._reviewModel({
      ...createReviewDto,
      user: userId,
    });

    return (await newReview.save()).populate(
      'user',
      'firstName lastName email -_id',
    );
  }

  async update(
    reviewId: Types.ObjectId,
    updateReviewDto: UpdateReviewDto,
    userId: Types.ObjectId,
  ) {
    const review = await this._reviewModel.findOne({
      _id: reviewId,
      user: userId,
    });

    if (!review)
      throw new NotFoundException(
        'Review not found or you are not authorized to update it',
      );

    if (updateReviewDto.rating) review.rating = updateReviewDto.rating;
    if (updateReviewDto.comment) review.comment = updateReviewDto.comment;

    return (await review.save()).populate(
      'user',
      'firstName lastName email -_id',
    );
  }

  async findByProduct(productId: Types.ObjectId) {
    return this._reviewModel
      .find({ product: productId })
      .populate('user', 'email firstName lastName')
      .sort({ createdAt: -1 });
  }

  async delete(reviewId: Types.ObjectId, userId: Types.ObjectId) {
    const results = await this._reviewModel.deleteOne({
      _id: reviewId,
      user: userId,
    });

    if (results.deletedCount === 0)
      throw new NotFoundException(
        'Review not found or you are not authorized to delete it',
      );

    return { message: 'Review successfully deleted' };
  }
}
