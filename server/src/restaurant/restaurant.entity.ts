import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { User } from 'src/auth/user.entity';
import { Menu } from 'src/menu/menu.entity';
import { ColumnNumericTransformer } from 'src/@common/transformers/numeric.transformer';

/**
 * 공유 음식점(장소). 개인 소유였던 기존 Post를 대체하는 공개 엔티티.
 * 어떤 사용자든 등록/조회할 수 있고, 메뉴 추천이 이 위에 쌓인다.
 */
@Entity()
export class Restaurant extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({
    type: 'decimal',
    transformer: new ColumnNumericTransformer(),
  })
  latitude: number;

  @Column({
    type: 'decimal',
    transformer: new ColumnNumericTransformer(),
  })
  longitude: number;

  @Column({ default: '' })
  address: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;

  @ManyToOne(() => User, (user) => user.restaurants, { eager: false })
  createdBy: User;

  @OneToMany(() => Menu, (menu) => menu.restaurant)
  menus: Menu[];
}
