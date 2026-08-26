import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateMenuDto {
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsOptional()
  price?: number;

  @IsString()
  @IsOptional()
  imageUri?: string;
}
