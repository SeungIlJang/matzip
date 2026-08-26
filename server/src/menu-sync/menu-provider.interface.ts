import { Restaurant } from 'src/restaurant/restaurant.entity';

export interface ImportedMenu {
  name: string;
  price?: number | null;
  source: string;
  sourceId?: string;
}

export interface MenuProvider {
  readonly name: string;
  isConfigured(): boolean;
  findMenus(restaurant: Restaurant): Promise<ImportedMenu[]>;
}
