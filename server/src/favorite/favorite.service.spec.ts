import { Repository } from 'typeorm';

import { FavoriteService } from './favorite.service';
import { Favorite } from './favorite.entity';

describe('FavoriteService', () => {
  let service: FavoriteService;

  beforeEach(() => {
    service = new FavoriteService({} as Repository<Favorite>);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
