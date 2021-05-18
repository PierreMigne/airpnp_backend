import { Property } from 'src/properties/entities/property.entity';
import { User } from '../../auth/entities/user.entity';
import {
  BaseEntity,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity()
@Unique(['property', 'user'])
export class Favorite extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Property, (property) => property.favorites, {
    eager: false,
    onDelete: 'CASCADE',
  })
  property: Property;

  @ManyToOne(() => User, (user) => user.favorites, {
    eager: false,
    onDelete: 'CASCADE',
  })
  user: User;
}
