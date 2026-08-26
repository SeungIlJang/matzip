import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { PlaceService } from './place.service';

@Controller('places')
@UseGuards(AuthGuard())
export class PlaceController {
  constructor(private placeService: PlaceService) {}

  @Get('/search')
  search(@Query('query') query: string) {
    return this.placeService.search(query);
  }
}
