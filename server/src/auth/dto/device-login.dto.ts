import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class DeviceLoginDto {
  @IsString()
  @MinLength(16)
  @MaxLength(128)
  @Matches(/^[a-zA-Z0-9-]+$/)
  deviceId: string;

  @IsString()
  @Matches(/^[A-Z]{2}$/)
  country: string;
}
