import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto.js';
import { UpdateAuthDto } from './dto/update-auth.dto.js';
import { InjectModel } from '@nestjs/mongoose';
import { HUserDocument, User } from '../DB/models/user.model.js';
import { Model } from 'mongoose';
import { compare, hash } from '../common/security/hash.js';
import { MailService } from '../mail/mail.service.js';
import { VerifyEmailDto } from './dto/verify-email.dto.js';
import { ResendOtpDto } from './dto/resend-otp.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { TokenService } from '../common/services/token.service.js';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly _userModel: Model<HUserDocument>,
    private readonly _mailService: MailService,
    private readonly _tokenService: TokenService,
  ) {}

  async register(createAuthDto: CreateAuthDto): Promise<HUserDocument> {
    const existingUser = await this._userModel.findOne({
      email: createAuthDto.email,
    });
    if (existingUser) throw new ConflictException('cannot use this email');
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOTP = await hash(otp);
    const expiryTime = new Date();
    expiryTime.setMinutes(expiryTime.getMinutes() + 10);

    const newUser = new this._userModel({
      ...createAuthDto,
      confirmEmailOTP: hashedOTP,
      otpExpiresAt: expiryTime,
    });

    const savedUser = await newUser.save();

    this._mailService.sendVerificationOtp(savedUser.email, otp);

    return savedUser;
  }

  async verifyEmail(
    verifyEmailDto: VerifyEmailDto,
  ): Promise<{ message: String }> {
    const user = await this._userModel.findOne({ email: verifyEmailDto.email });
    if (!user) throw new NotFoundException('Invalid Email');

    if (user.confirmEmail)
      throw new BadRequestException('user has already confirmed his email');

    if (
      !user.confirmEmailOTP ||
      !(await compare(verifyEmailDto.confirmEmailOTP, user.confirmEmailOTP))
    )
      throw new BadRequestException('Invalid OTP');

    const expiresAt = user.otpExpiresAt
      ? new Date(user.otpExpiresAt).getTime()
      : NaN;
    if (Number.isNaN(expiresAt) || Date.now() > expiresAt)
      throw new BadRequestException('Expired OTP');

    user.confirmEmail = new Date();
    user.confirmEmailOTP = undefined;
    user.otpExpiresAt = undefined;

    await user.save();

    return { message: 'Successfully verified' };
  }

  async resendOtp(resendOtpDto: ResendOtpDto): Promise<{ message: string }> {
    const { email } = resendOtpDto;
    const user = await this._userModel.findOne({ email });
    if (!user) throw new NotFoundException('Not Found Email');

    if (user.confirmEmail)
      throw new BadRequestException('user has already confirmed his email');

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOTP = await hash(otp);
    const newExpiryTime = new Date();
    newExpiryTime.setMinutes(newExpiryTime.getMinutes() + 10);

    user.confirmEmailOTP = hashedOTP;
    user.otpExpiresAt = newExpiryTime;
    await user.save();

    await this._mailService.sendVerificationOtp(user.email, otp);

    return { message: 'new OTP has been sent' };
  }

  async login(loginDto: LoginDto): Promise<{ message: string; token: string }> {
    const { email, password } = loginDto;
    const user = await this._userModel.findOne({
      email,
      confirmEmail: { $exists: true },
    });
    if (!user) throw new NotFoundException('Not Found Email');

    const isPasswordCorrect = await compare(password, user.password);
    if (!isPasswordCorrect) throw new BadRequestException('Wrong Credentials');

    const token = await this._tokenService.generateToken(user._id, user.role);

    return {
      message: 'Login Successfully',
      token,
    };
  }
}
