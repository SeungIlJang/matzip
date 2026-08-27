import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Restaurant } from './restaurant.entity';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { MenuService } from 'src/menu/menu.service';
import { Favorite } from 'src/favorite/favorite.entity';
import { User } from 'src/auth/user.entity';
import { MenuSyncService } from 'src/menu-sync/menu-sync.service';
import { localizeName } from 'src/@common/utils/localize-name';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant)
    private restaurantRepository: Repository<Restaurant>,
    @InjectRepository(Favorite)
    private favoriteRepository: Repository<Favorite>,
    private menuService: MenuService,
    private menuSyncService: MenuSyncService,
  ) {}

  async createRestaurant(createRestaurantDto: CreateRestaurantDto, user: User) {
    const localized = await localizeName(createRestaurantDto.name);
    const restaurant = this.restaurantRepository.create({
      name: createRestaurantDto.name,
      ...localized,
      latitude: createRestaurantDto.latitude,
      longitude: createRestaurantDto.longitude,
      address: createRestaurantDto.address ?? '',
      createdBy: user,
    });

    try {
      await this.restaurantRepository.save(restaurant);
      await this.menuSyncService.sync(restaurant);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        '음식점을 추가하는 도중 에러가 발생했습니다.',
      );
    }

    const { createdBy, ...rest } = restaurant;
    return rest;
  }

  /** 지도 영역(bounding box) 안의 공개 음식점 마커. 각 음식점의 총 추천 수 포함. */
  async getNearbyRestaurants(
    lat: number,
    lng: number,
    latDelta: number,
    lngDelta: number,
  ) {
    const minLat = lat - latDelta / 2;
    const maxLat = lat + latDelta / 2;
    const minLng = lng - lngDelta / 2;
    const maxLng = lng + lngDelta / 2;

    const rows = await this.restaurantRepository
      .createQueryBuilder('restaurant')
      .leftJoin('restaurant.menus', 'menu')
      .leftJoin('menu.recommendations', 'rec')
      .where('restaurant.latitude BETWEEN :minLat AND :maxLat', {
        minLat,
        maxLat,
      })
      .andWhere('restaurant.longitude BETWEEN :minLng AND :maxLng', {
        minLng,
        maxLng,
      })
      .select('restaurant.id', 'id')
      .addSelect('restaurant.name', 'name')
      .addSelect('restaurant.nameEn', 'nameEn')
      .addSelect('restaurant.nameJa', 'nameJa')
      .addSelect('restaurant.latitude', 'latitude')
      .addSelect('restaurant.longitude', 'longitude')
      .addSelect('COUNT(DISTINCT rec.id)', 'recommendationCount')
      .groupBy('restaurant.id')
      .getRawMany();

    return rows.map((row) => ({
      id: Number(row.id),
      name: row.name,
      nameEn: row.nameEn ?? null,
      nameJa: row.nameJa ?? null,
      latitude: Number(row.latitude),
      longitude: Number(row.longitude),
      recommendationCount: Number(row.recommendationCount),
    }));
  }

  /**
   * 네이버 검색으로 고른 장소를 식당으로 확정(get-or-create).
   * 같은 이름+좌표면 기존 식당을 재사용하고, 없으면 새로 만든다.
   * (사용자가 "맛집 등록" 단계를 거치지 않고 검색 → 바로 메뉴 화면으로 가게 함)
   */
  async getOrCreateFromPlace(dto: CreateRestaurantDto, user: User) {
    const existing = await this.restaurantRepository.findOne({
      where: {
        name: dto.name,
        latitude: dto.latitude,
        longitude: dto.longitude,
      },
    });

    if (existing) {
      if (this.menuSyncService.needsSync(existing)) {
        await this.menuSyncService.sync(existing);
      }
      return existing;
    }

    const localized = await localizeName(dto.name);
    const restaurant = this.restaurantRepository.create({
      name: dto.name,
      ...localized,
      latitude: dto.latitude,
      longitude: dto.longitude,
      address: dto.address ?? '',
      createdBy: user,
    });

    try {
      await this.restaurantRepository.save(restaurant);
      await this.menuSyncService.sync(restaurant);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        '음식점을 불러오는 도중 에러가 발생했습니다.',
      );
    }

    const { createdBy, ...rest } = restaurant;
    return rest;
  }

  async getRestaurantById(id: number, user: User) {
    const restaurant = await this.restaurantRepository.findOneBy({ id });

    if (!restaurant) {
      throw new NotFoundException('존재하지 않는 음식점입니다.');
    }

    if (this.menuSyncService.needsSync(restaurant)) {
      await this.menuSyncService.sync(restaurant);
    }

    const menus = await this.menuService.getMenusWithStats(
      id,
      user.country ?? null,
      user.id,
    );

    const favorite = await this.favoriteRepository.findOne({
      where: { restaurantId: id, userId: user.id },
    });

    return { ...restaurant, menus, isFavorite: Boolean(favorite) };
  }

  async syncRestaurantMenus(id: number) {
    const restaurant = await this.restaurantRepository.findOneBy({ id });
    if (!restaurant) throw new NotFoundException('존재하지 않는 음식점입니다.');
    return this.menuSyncService.sync(restaurant);
  }

  async searchRestaurants(query: string, page: number) {
    const perPage = 10;
    const offset = (page - 1) * perPage;

    const restaurants = await this.restaurantRepository
      .createQueryBuilder('restaurant')
      .where('restaurant.name like :query', { query: `%${query}%` })
      .orWhere('restaurant.address like :query', { query: `%${query}%` })
      .orderBy('restaurant.createdAt', 'DESC')
      .skip(offset)
      .take(perPage)
      .getMany();

    return restaurants;
  }
}
