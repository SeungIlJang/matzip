import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

import { User } from 'src/auth/user.entity';
import { Restaurant } from 'src/restaurant/restaurant.entity';

/** 가고 싶은 음식점 저장. (user, restaurant) 유니크. */
@Entity()
@Unique(['userId', 'restaurantId'])
export class Favorite extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  restaurantId: number;

  @Column()
  userId: number;

  @ManyToOne(() => Restaurant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'restaurantId' })
  restaurant: Restaurant;

  @ManyToOne(() => User, (user) => user.favorites, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
