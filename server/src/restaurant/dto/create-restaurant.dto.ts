import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateRestaurantDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  latitude: number;

  @IsNotEmpty()
  longitude: number;

  @IsString()
  @IsOptional()
  address?: string;
}
