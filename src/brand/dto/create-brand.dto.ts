import { Transform } from "class-transformer";
import { IsArray, IsMongoId, IsNotEmpty, IsString, Length } from "class-validator";

export class CreateBrandDto {

    @IsString()
    @IsNotEmpty({
        message:'brand name is required'
    })
    @Length(2,20,{
        message:'brand name must be between 2 and 20 characters'
    })
    @Transform(({value})=> value?.trim())
    name:string;

    @IsArray({message:'categories must be an array'})
    @IsMongoId({each:true,message:'each category must be a valid MongoId'})
    @IsNotEmpty({message:'one or more categories are required'})
    @Transform(({value})=>{
        if(typeof value === 'string'){
            try{
                return JSON.parse(value);
            } catch {
                return value;
            }
        }
        return value;
    })
    categories:[string];

}
