import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { MenuService } from './menu.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { GetUser } from 'src/@common/decorators/get-user.decorator';
import { User } from 'src/auth/user.entity';

@Controller('restaurants/:restaurantId/menus')
@UseGuards(AuthGuard())
export class MenuController {
  constructor(private menuService: MenuService) {}

  @Get()
  getMenus(
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
    @GetUser() user: User,
  ) {
    return this.menuService.getMenusWithStats(
      restaurantId,
      user.country ?? null,
      user.id,
    );
  }

  @Post()
  @UsePipes(ValidationPipe)
  createMenu(
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
    @Body() createMenuDto: CreateMenuDto,
    @GetUser() user: User,
  ) {
    return this.menuService.createMenu(restaurantId, createMenuDto, user);
  }
}
