import { FavoriteController } from './favorite.controller';
import { FavoriteService } from './favorite.service';

describe('FavoriteController', () => {
  let controller: FavoriteController;

  beforeEach(() => {
    controller = new FavoriteController({} as FavoriteService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
