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
  Unique,
  UpdateDateColumn,
} from 'typeorm';

import { User } from 'src/auth/user.entity';
import { Menu } from 'src/menu/menu.entity';
import { Image } from 'src/image/image.entity';

/**
 * 핵심 단위. "누가(user) / 어느 나라(country) / 어떤 메뉴(menu)를 몇 점(score)으로 추천"인지 기록.
 * country는 작성 시점의 user.country를 비정규화 복제 → 국가별 집계를 join 없이 GROUP BY 로 처리.
 * (user, menu) 유니크: 한 사용자는 한 메뉴에 하나의 추천만 (재추천 시 갱신).
 */
@Entity()
@Unique(['userId', 'menuId'])
export class Recommendation extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  menuId: number;

  /** 작성 시점 추천자의 국적(ISO alpha-2). 국가별 집계용 비정규화 필드. */
  @Column({ nullable: true })
  country?: string;

  /** 평점 1~5 */
  @Column()
  score: number;

  @Column({ default: '' })
  comment: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;

  @ManyToOne(() => User, (user) => user.recommendations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Menu, (menu) => menu.recommendations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'menuId' })
  menu: Menu;

  @OneToMany(() => Image, (image) => image.recommendation)
  images: Image[];
}
