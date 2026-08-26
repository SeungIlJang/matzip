import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RestaurantController } from './restaurant.controller';
import { RestaurantService } from './restaurant.service';
import { Restaurant } from './restaurant.entity';
import { Favorite } from 'src/favorite/favorite.entity';
import { MenuModule } from 'src/menu/menu.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Restaurant, Favorite]),
    MenuModule,
    AuthModule,
  ],
  controllers: [RestaurantController],
  providers: [RestaurantService],
  exports: [RestaurantService],
})
export class RestaurantModule {}
