import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Menu } from './menu.entity';
import { CreateMenuDto } from './dto/create-menu.dto';
import { Restaurant } from 'src/restaurant/restaurant.entity';
import { User } from 'src/auth/user.entity';

export interface MenuWithStats {
  id: number;
  name: string;
  price: number | null;
  imageUri: string | null;
  totalCount: number;
  totalAvgScore: number;
  countryCount: number;
  countryAvgScore: number;
  likeCount: number;
  dislikeCount: number;
  myVote: 'like' | 'dislike' | null;
}

@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(Menu)
    private menuRepository: Repository<Menu>,
    @InjectRepository(Restaurant)
    private restaurantRepository: Repository<Restaurant>,
  ) {}

  async createMenu(
    restaurantId: number,
    createMenuDto: CreateMenuDto,
    user: User,
  ) {
    const restaurant = await this.restaurantRepository.findOneBy({
      id: restaurantId,
    });

    if (!restaurant) {
      throw new NotFoundException('존재하지 않는 음식점입니다.');
    }

    const menu = this.menuRepository.create({
      ...createMenuDto,
      restaurantId,
      createdBy: user,
    });

    try {
      await this.menuRepository.save(menu);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        '메뉴를 추가하는 도중 에러가 발생했습니다.',
      );
    }

    const { createdBy, ...rest } = menu;
    return rest;
  }

  /**
   * 음식점의 메뉴 목록을 추천 통계와 함께 반환.
   * 전체(total) 기준과 요청 사용자 국가(country) 기준 평점/추천수를 각각 집계한다.
   * country 기준 평점 내림차순 → 전체 평점 내림차순으로 정렬.
   */
  async getMenusWithStats(
    restaurantId: number,
    country: string | null,
    userId: number,
  ): Promise<MenuWithStats[]> {
    const rows = await this.menuRepository
      .createQueryBuilder('menu')
      .leftJoin('menu.recommendations', 'rec')
      .where('menu.restaurantId = :restaurantId', { restaurantId })
      .select('menu.id', 'id')
      .addSelect('menu.name', 'name')
      .addSelect('menu.price', 'price')
      .addSelect('menu.imageUri', 'imageUri')
      .addSelect('COUNT(rec.id)', 'totalCount')
      .addSelect('COALESCE(AVG(rec.score), 0)', 'totalAvgScore')
      .addSelect(
        'COUNT(CASE WHEN rec.country = :country THEN 1 END)',
        'countryCount',
      )
      .addSelect(
        'COALESCE(AVG(CASE WHEN rec.country = :country THEN rec.score END), 0)',
        'countryAvgScore',
      )
      .addSelect('SUM(CASE WHEN rec.score >= 4 THEN 1 ELSE 0 END)', 'likeCount')
      .addSelect(
        'SUM(CASE WHEN rec.score <= 2 THEN 1 ELSE 0 END)',
        'dislikeCount',
      )
      .addSelect(
        'MAX(CASE WHEN rec.userId = :userId THEN rec.score ELSE NULL END)',
        'myScore',
      )
      .setParameter('country', country)
      .setParameter('userId', userId)
      .groupBy('menu.id')
      .orderBy('"countryAvgScore"', 'DESC')
      .addOrderBy('"totalAvgScore"', 'DESC')
      .getRawMany();

    return rows.map((row) => {
      const myScore = row.myScore === null ? null : Number(row.myScore);
      return {
        id: Number(row.id),
        name: row.name,
        price: row.price === null ? null : Number(row.price),
        imageUri: row.imageUri ?? null,
        totalCount: Number(row.totalCount),
        totalAvgScore: Number(Number(row.totalAvgScore).toFixed(2)),
        countryCount: Number(row.countryCount),
        countryAvgScore: Number(Number(row.countryAvgScore).toFixed(2)),
        likeCount: Number(row.likeCount),
        dislikeCount: Number(row.dislikeCount),
        myVote: myScore === null ? null : myScore >= 4 ? 'like' : 'dislike',
      };
    });
  }
}
