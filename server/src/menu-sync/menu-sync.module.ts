import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MenuModule } from 'src/menu/menu.module';
import { Restaurant } from 'src/restaurant/restaurant.entity';
import { MenuSyncService } from './menu-sync.service';
import { TourApiProvider } from './tour-api.provider';

@Module({
  imports: [TypeOrmModule.forFeature([Restaurant]), MenuModule],
  providers: [MenuSyncService, TourApiProvider],
  exports: [MenuSyncService],
})
export class MenuSyncModule {}
