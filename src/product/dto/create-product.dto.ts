import { Transform, Type } from "class-transformer";
import { IsInt, IsMongoId, IsNotEmpty, IsNumber, IsString, Length, Min } from "class-validator";

export class CreateProductDto {

    @IsString({
        message:'product name must be a string'
    })
    @IsNotEmpty({
        message:'product name is required'
    })
    @Length(2,200)
    @Transform(({value})=> value?.trim())
    name: string;

    @Type(() => Number)
    @IsNumber({},{
        message:'product price must be a number'
    })
    @Min(1,{message:'product price must be greater than 0'})
    price: number;

    @Type(() => Number)
    @IsNumber({},{
        message:'product stock must be a number'
    })
    @Min(0,{message:'product stock cannot be negative'})
    @IsInt()
    stock: number;

    @IsMongoId({message:"invalid brand id"})
    @IsNotEmpty({message:'brand id is required'})
    brand:string;

    @IsMongoId({message:"invalid category id"})
    @IsNotEmpty({message:'category id is required'})
    category:string;
}
