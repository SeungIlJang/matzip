import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { BadRequestException, Injectable } from '@nestjs/common';

import { Favorite } from './favorite.entity';
import { User } from 'src/auth/user.entity';

@Injectable()
export class FavoriteService {
  constructor(
    @InjectRepository(Favorite)
    private favoriteRepository: Repository<Favorite>,
  ) {}

  /** 내가 즐겨찾기한 음식점 목록 */
  async getMyFavoriteRestaurants(page: number, user: User) {
    const perPage = 10;
    const offset = (page - 1) * perPage;

    const favorites = await this.favoriteRepository
      .createQueryBuilder('favorite')
      .innerJoinAndSelect('favorite.restaurant', 'restaurant')
      .where('favorite.userId = :userId', { userId: user.id })
      .orderBy('favorite.createdAt', 'DESC')
      .skip(offset)
      .take(perPage)
      .getMany();

    return favorites.map((favorite) => favorite.restaurant);
  }

  async toggleFavorite(restaurantId: number, user: User): Promise<number> {
    if (!restaurantId) {
      throw new BadRequestException('존재하지 않는 음식점입니다.');
    }

    const existingFavorite = await this.favoriteRepository.findOne({
      where: { restaurantId, userId: user.id },
    });

    if (existingFavorite) {
      await this.favoriteRepository.delete(existingFavorite.id);

      return existingFavorite.restaurantId;
    }

    const favorite = this.favoriteRepository.create({
      restaurantId,
      userId: user.id,
    });

    await this.favoriteRepository.save(favorite);

    return favorite.restaurantId;
  }
}
