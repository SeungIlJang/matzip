import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Recommendation } from './recommendation.entity';
import { CreateRecommendationDto } from './dto/create-recommendation.dto';
import { Menu } from 'src/menu/menu.entity';
import { Image } from 'src/image/image.entity';
import { User } from 'src/auth/user.entity';

@Injectable()
export class RecommendationService {
  constructor(
    @InjectRepository(Recommendation)
    private recommendationRepository: Repository<Recommendation>,
    @InjectRepository(Menu)
    private menuRepository: Repository<Menu>,
    @InjectRepository(Image)
    private imageRepository: Repository<Image>,
  ) {}

  /**
   * 메뉴에 대한 내 추천을 생성 또는 갱신(upsert).
   * 추천자의 현재 국적(user.country)을 recommendation.country 로 비정규화 저장한다.
   */
  async upsertRecommendation(
    menuId: number,
    dto: CreateRecommendationDto,
    user: User,
  ) {
    const menu = await this.menuRepository.findOneBy({ id: menuId });
    if (!menu) {
      throw new NotFoundException('존재하지 않는 메뉴입니다.');
    }

    const { score, comment, imageUris = [] } = dto;

    let recommendation = await this.recommendationRepository.findOne({
      where: { userId: user.id, menuId },
    });

    if (recommendation) {
      recommendation.score = score;
      recommendation.comment = comment ?? '';
      recommendation.country = user.country ?? null;
    } else {
      recommendation = this.recommendationRepository.create({
        userId: user.id,
        menuId,
        score,
        comment: comment ?? '',
        country: user.country ?? null,
      });
    }

    try {
      await this.recommendationRepository.save(recommendation);

      // 이미지 교체: 기존 이미지 제거 후 새로 저장
      await this.imageRepository.delete({
        recommendation: { id: recommendation.id },
      });
      if (imageUris.length > 0) {
        const images = imageUris.map((image) =>
          this.imageRepository.create({ uri: image.uri, recommendation }),
        );
        await this.imageRepository.save(images);
      }
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        '추천을 저장하는 도중 에러가 발생했습니다.',
      );
    }

    return recommendation;
  }

  /** 메뉴의 추천 목록. country 지정 시 해당 국가 추천만 필터. */
  async getRecommendationsByMenu(menuId: number, country?: string) {
    const queryBuilder = this.recommendationRepository
      .createQueryBuilder('rec')
      .leftJoinAndSelect('rec.images', 'image')
      .leftJoin('rec.user', 'user')
      .addSelect(['user.id', 'user.nickname', 'user.country', 'user.imageUri'])
      .where('rec.menuId = :menuId', { menuId })
      .orderBy('rec.createdAt', 'DESC');

    if (country) {
      queryBuilder.andWhere('rec.country = :country', { country });
    }

    return queryBuilder.getMany();
  }

  async deleteRecommendation(id: number, user: User): Promise<number> {
    const result = await this.recommendationRepository
      .createQueryBuilder()
      .delete()
      .from(Recommendation)
      .where('id = :id', { id })
      .andWhere('userId = :userId', { userId: user.id })
      .execute();

    if (result.affected === 0) {
      throw new NotFoundException('존재하지 않는 추천입니다.');
    }

    return id;
  }

  /**
   * 국가별 트렌딩 피드: 특정 국가 사람들이 많이/높게 추천한 메뉴 랭킹.
   * 메뉴 + 음식점 정보와 함께 반환.
   */
  async getFeedByCountry(country: string, page: number) {
    const perPage = 10;
    const offset = (page - 1) * perPage;

    const rows = await this.recommendationRepository
      .createQueryBuilder('rec')
      .innerJoin('rec.menu', 'menu')
      .innerJoin('menu.restaurant', 'restaurant')
      .where('rec.country = :country', { country })
      .select('menu.id', 'menuId')
      .addSelect('menu.name', 'menuName')
      .addSelect('menu.imageUri', 'menuImageUri')
      .addSelect('restaurant.id', 'restaurantId')
      .addSelect('restaurant.name', 'restaurantName')
      .addSelect('COUNT(rec.id)', 'count')
      .addSelect('AVG(rec.score)', 'avgScore')
      .groupBy('menu.id')
      .addGroupBy('restaurant.id')
      .orderBy('"count"', 'DESC')
      .addOrderBy('"avgScore"', 'DESC')
      .offset(offset)
      .limit(perPage)
      .getRawMany();

    return rows.map((row) => ({
      menuId: Number(row.menuId),
      menuName: row.menuName,
      menuImageUri: row.menuImageUri ?? null,
      restaurantId: Number(row.restaurantId),
      restaurantName: row.restaurantName,
      count: Number(row.count),
      avgScore: Number(Number(row.avgScore).toFixed(2)),
    }));
  }
}
