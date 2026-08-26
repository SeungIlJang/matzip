import {
  Body,
  Controller,
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

import { RestaurantService } from './restaurant.service';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { GetUser } from 'src/@common/decorators/get-user.decorator';
import { User } from 'src/auth/user.entity';

@Controller('restaurants')
@UseGuards(AuthGuard())
export class RestaurantController {
  constructor(private restaurantService: RestaurantService) {}

  @Get()
  getNearbyRestaurants(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('latDelta') latDelta: string,
    @Query('lngDelta') lngDelta: string,
  ) {
    return this.restaurantService.getNearbyRestaurants(
      Number(lat),
      Number(lng),
      Number(latDelta) || 0.1,
      Number(lngDelta) || 0.1,
    );
  }

  @Get('/search')
  searchRestaurants(
    @Query('query') query: string,
    @Query('page') page: number,
  ) {
    return this.restaurantService.searchRestaurants(query, page || 1);
  }

  @Get('/:id')
  getRestaurantById(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: User,
  ) {
    return this.restaurantService.getRestaurantById(id, user);
  }

  @Post()
  @UsePipes(ValidationPipe)
  createRestaurant(
    @Body() createRestaurantDto: CreateRestaurantDto,
    @GetUser() user: User,
  ) {
    return this.restaurantService.createRestaurant(createRestaurantDto, user);
  }

  @Post('/from-place')
  @UsePipes(ValidationPipe)
  getOrCreateFromPlace(
    @Body() createRestaurantDto: CreateRestaurantDto,
    @GetUser() user: User,
  ) {
    return this.restaurantService.getOrCreateFromPlace(
      createRestaurantDto,
      user,
    );
  }

  @Post('/:id/menus/sync')
  syncRestaurantMenus(@Param('id', ParseIntPipe) id: number) {
    return this.restaurantService.syncRestaurantMenus(id);
  }
}
