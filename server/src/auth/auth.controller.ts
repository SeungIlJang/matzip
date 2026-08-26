import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Patch,
  Post,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { AuthService } from './auth.service';
import { User } from './user.entity';
import { AuthCredentialsDto } from './dto/auth-credential.dto';
import { EditProfileDto } from './dto/edit-profile.dto';
import { GetUser } from 'src/@common/decorators/get-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/signup')
  signup(
    @Body(ValidationPipe) authCredentialsDto: AuthCredentialsDto,
  ): Promise<void> {
    return this.authService.signup(authCredentialsDto);
  }

  @Post('/signin')
  signin(
    @Body(ValidationPipe) authCredentialsDto: AuthCredentialsDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    return this.authService.signin(authCredentialsDto);
  }

  @Get('/refresh')
  refresh(@Headers('authorization') authorization?: string): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const refreshToken = authorization?.replace(/^Bearer\s+/i, '') ?? '';
    return this.authService.refreshToken(refreshToken);
  }

  @Get('/me')
  @UseGuards(AuthGuard())
  getProfile(@GetUser() user: User) {
    return this.authService.getProfile(user);
  }

  @Patch('/me')
  @UseGuards(AuthGuard())
  editProfile(
    @Body(ValidationPipe) editProfileDto: EditProfileDto,
    @GetUser() user: User,
  ) {
    return this.authService.editProfile(editProfileDto, user);
  }

  @Post('/logout')
  @UseGuards(AuthGuard())
  logout(@GetUser() user: User) {
    return this.authService.deleteRefreshToken(user.id);
  }

  @Delete('/me')
  @UseGuards(AuthGuard())
  deleteAccount(@GetUser() user: User) {
    return this.authService.deleteAccount(user);
  }

  @Post('/oauth/kakao')
  kakaoLogin(@Body() kakaoToken: { token: string }) {
    return this.authService.kakaoLogin(kakaoToken);
  }

  @Post('/oauth/apple')
  appleLogin(
    @Body()
    appleIdentity: {
      identityToken: string;
      appId: string;
      nickname: string | null;
    },
  ) {
    return this.authService.appleLogin(appleIdentity);
  }

  @Post('/oauth/google')
  googleLogin(@Body() googleIdentity: { idToken: string }) {
    return this.authService.googleLogin(googleIdentity);
  }
}
