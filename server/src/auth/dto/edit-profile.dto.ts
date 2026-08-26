import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class EditProfileDto {
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  nickname: string;

  @IsString()
  @IsOptional()
  imageUri?: string;

  /** 국적(ISO 3166-1 alpha-2) */
  @IsString()
  @IsOptional()
  country?: string;

  /** 선호 언어 */
  @IsString()
  @IsOptional()
  language?: string;
}
