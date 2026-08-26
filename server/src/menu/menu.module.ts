import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MenuController } from './menu.controller';
import { MenuService } from './menu.service';
import { Menu } from './menu.entity';
import { Restaurant } from 'src/restaurant/restaurant.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Menu, Restaurant]), AuthModule],
  controllers: [MenuController],
  providers: [MenuService],
  exports: [MenuService],
})
export class MenuModule {}
