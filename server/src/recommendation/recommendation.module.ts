import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RecommendationController } from './recommendation.controller';
import { RecommendationService } from './recommendation.service';
import { Recommendation } from './recommendation.entity';
import { Menu } from 'src/menu/menu.entity';
import { Image } from 'src/image/image.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Recommendation, Menu, Image]),
    AuthModule,
  ],
  controllers: [RecommendationController],
  providers: [RecommendationService],
})
export class RecommendationModule {}
