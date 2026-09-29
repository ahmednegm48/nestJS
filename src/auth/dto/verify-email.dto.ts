import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class VerifyEmailDto {

  @IsEmail({}, { message: 'please insert a valid Email' })
  @IsNotEmpty()
  @Transform(({ value }) => {
    value?.toLowerCase().trim();
  })
  email: string;

  @IsString()
  @IsNotEmpty({message: 'OTP verification code is required'})
  confirmEmailOTP:string;

}
