import { Transform } from "class-transformer";
import { IsNotEmpty, IsString, Length } from "class-validator";

export class CreateCategoryDto {

    @IsString()
    @IsNotEmpty({message:"Category name is required"})
    @Length(2,20, {
        message:"Category name must be between 2 and 20 character"
    })
    @Transform(({value})=>value?.trim())
    name:string;
}
