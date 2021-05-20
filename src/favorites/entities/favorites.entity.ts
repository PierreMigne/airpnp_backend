import { Property } from 'src/properties/entities/property.entity';
import { User } from '../../auth/entities/user.entity';
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity()
@Unique(['property', 'user'])
export class Favorite extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  propertyId: number;

  @ManyToOne(() => Property, (property) => property.favorites, {
    eager: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  property: Property;

  // @Column()
  // userId: number;

  @ManyToOne(() => User, (user) => user.favorites, {
    eager: false,
    onDelete: 'CASCADE',
  })
  // @JoinColumn()
  user: User;
}
