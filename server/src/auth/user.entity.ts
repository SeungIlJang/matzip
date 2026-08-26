import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';

import { Favorite } from 'src/favorite/favorite.entity';
import { Restaurant } from 'src/restaurant/restaurant.entity';
import { Menu } from 'src/menu/menu.entity';
import { Recommendation } from 'src/recommendation/recommendation.entity';

@Entity()
@Unique(['email'])
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  loginType: 'email' | 'kakao' | 'apple' | 'google' | 'device';

  @Column()
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  nickname?: string;

  @Column({ nullable: true })
  imageUri?: string;

  @Column({ nullable: true })
  kakaoImageUri?: string;

  /** 사용자의 국적(입맛 그룹). ISO 3166-1 alpha-2 (예: 'US', 'JP', 'VN') */
  @Column({ nullable: true })
  country?: string;

  /** 선호 언어 (i18n). 예: 'en', 'ko' */
  @Column({ nullable: true })
  language?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;

  @Column({ nullable: true })
  @Exclude()
  hashedRefreshToken?: string;

  @OneToMany(() => Restaurant, (restaurant) => restaurant.createdBy)
  restaurants: Restaurant[];

  @OneToMany(() => Menu, (menu) => menu.createdBy)
  menus: Menu[];

  @OneToMany(() => Recommendation, (recommendation) => recommendation.user)
  recommendations: Recommendation[];

  @OneToMany(() => Favorite, (favorite) => favorite.user)
  favorites: Favorite[];
}
