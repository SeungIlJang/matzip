import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { User } from 'src/auth/user.entity';
import { Restaurant } from 'src/restaurant/restaurant.entity';
import { Recommendation } from 'src/recommendation/recommendation.entity';

/**
 * 음식점의 개별 메뉴. 추천(Recommendation)의 대상이 되는 최소 단위.
 */
@Entity()
export class Menu extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  price?: number;

  @Column({ nullable: true })
  imageUri?: string;

  @Column()
  restaurantId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;

  @ManyToOne(() => Restaurant, (restaurant) => restaurant.menus, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'restaurantId' })
  restaurant: Restaurant;

  @ManyToOne(() => User, (user) => user.menus, { eager: false })
  createdBy: User;

  @OneToMany(() => Recommendation, (recommendation) => recommendation.menu)
  recommendations: Recommendation[];
}
