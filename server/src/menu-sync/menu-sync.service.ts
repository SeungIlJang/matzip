import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { MenuService } from 'src/menu/menu.service';
import { Restaurant } from 'src/restaurant/restaurant.entity';
import { MenuProvider } from './menu-provider.interface';
import { TourApiProvider } from './tour-api.provider';

@Injectable()
export class MenuSyncService {
  private readonly logger = new Logger(MenuSyncService.name);
  private readonly providers: MenuProvider[];

  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
    private readonly menus: MenuService,
    tourApi: TourApiProvider,
  ) {
    this.providers = [tourApi];
  }

  async sync(restaurant: Restaurant) {
    let imported = 0;
    const sources: string[] = [];
    let configuredProviders = 0;
    for (const provider of this.providers) {
      if (!provider.isConfigured()) continue;
      configuredProviders += 1;
      try {
        const candidates = await provider.findMenus(restaurant);
        imported += await this.menus.importMenus(restaurant.id, candidates);
        if (candidates.length) sources.push(provider.name);
      } catch (error) {
        this.logger.warn(
          `${provider.name} menu sync failed for restaurant ${
            restaurant.id
          }: ${String(error)}`,
        );
      }
    }

    if (configuredProviders > 0) {
      restaurant.menuSyncedAt = new Date();
      await this.restaurants.save(restaurant);
    }
    return { imported, sources, syncedAt: restaurant.menuSyncedAt };
  }
}
