import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { GenderEnum, RoleEnum } from '../../common/enums/user.enum.js';

export class CreateAuthDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 20, {
    message: 'Firstname must be between 2 to 20 character long',
  })
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @Length(2, 20, {
    message: 'Lastname must be between 2 to 20 character long',
  })
  lastName: string;

  @IsEmail({}, { message: 'please insert a valid Email' })
  @IsNotEmpty()
  @Transform(({ value }) => {
    value?.toLowerCase().trim();
  })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  password: string;

  @IsEnum(GenderEnum, {
    message: 'provided value is not a gender option',
  })
  @IsOptional()
  gender?: GenderEnum;

  @IsEnum(RoleEnum,{
    message: 'provided value is not a role option',
  })
  @IsOptional()
  role?: RoleEnum;
}
