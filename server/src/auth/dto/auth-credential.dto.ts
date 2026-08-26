import {
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class AuthCredentialsDto {
  @IsString()
  @MinLength(6)
  @MaxLength(50)
  @Matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, {
    message: '이메일 형식이 아닙니다.',
  })
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(20)
  @Matches(/^[a-zA-Z0-9]*$/, {
    message: '비밀번호가 영어 또는 숫자 조합이 아닙니다.',
  })
  password: string;

  /** 국적(ISO 3166-1 alpha-2). 가입 시 입맛 그룹 선택. */
  @IsString()
  @IsOptional()
  country?: string;
}
