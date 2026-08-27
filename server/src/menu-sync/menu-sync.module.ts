import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MenuModule } from 'src/menu/menu.module';
import { Restaurant } from 'src/restaurant/restaurant.entity';
import { MenuSyncService } from './menu-sync.service';
import { TourApiProvider } from './tour-api.provider';
import { GoodPriceProvider } from './good-price.provider';

@Module({
  imports: [TypeOrmModule.forFeature([Restaurant]), MenuModule],
  providers: [MenuSyncService, TourApiProvider, GoodPriceProvider],
  exports: [MenuSyncService],
})
export class MenuSyncModule {}
