import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { RecommendationService } from './recommendation.service';
import { CreateRecommendationDto } from './dto/create-recommendation.dto';
import { GetUser } from 'src/@common/decorators/get-user.decorator';
import { User } from 'src/auth/user.entity';

@Controller()
@UseGuards(AuthGuard())
export class RecommendationController {
  constructor(private recommendationService: RecommendationService) {}

  @Get('/menus/:menuId/recommendations')
  getRecommendations(
    @Param('menuId', ParseIntPipe) menuId: number,
    @Query('country') country?: string,
  ) {
    return this.recommendationService.getRecommendationsByMenu(menuId, country);
  }

  @Post('/menus/:menuId/recommendations')
  @UsePipes(ValidationPipe)
  upsertRecommendation(
    @Param('menuId', ParseIntPipe) menuId: number,
    @Body() createRecommendationDto: CreateRecommendationDto,
    @GetUser() user: User,
  ) {
    return this.recommendationService.upsertRecommendation(
      menuId,
      createRecommendationDto,
      user,
    );
  }

  @Delete('/recommendations/:id')
  deleteRecommendation(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: User,
  ): Promise<number> {
    return this.recommendationService.deleteRecommendation(id, user);
  }

  @Get('/feed')
  getFeed(
    @Query('country') country: string,
    @Query('page') page: number,
    @GetUser() user: User,
  ) {
    // country 미지정 시 요청자의 국가 기준
    const targetCountry = country ?? user.country;
    return this.recommendationService.getFeedByCountry(
      targetCountry,
      page || 1,
    );
  }
}
