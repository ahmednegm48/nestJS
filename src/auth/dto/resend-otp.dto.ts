import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class ResendOtpDto {

  @IsEmail({}, { message: 'please insert a valid Email' })
  @IsNotEmpty()
  @Transform(({ value }) => {
    value?.toLowerCase().trim();
  })
  email: string;
}
