import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateRecommendationDto {
  /** 평점 1~5 */
  @IsNumber()
  @Min(1)
  @Max(5)
  score: number;

  @IsString()
  @IsOptional()
  comment?: string;

  @IsArray()
  @IsOptional()
  imageUris?: { uri: string }[];
}
