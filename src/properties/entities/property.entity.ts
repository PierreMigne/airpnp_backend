import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PropertyCategories } from '../property-categories.enum';
import { User } from '../../auth/entities/user.entity';

@Entity()
export class Property extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  category: PropertyCategories;

  @Column()
  location: string;

  @Column()
  surface: number;

  @Column()
  peoples: number;

  @Column()
  beds: number;

  @Column()
  description: string;

  @Column('simple-array', { nullable: true })
  options: string[];

  @Column()
  price: number;

  @Column()
  createdAt: Date;

  @Column()
  isVisible: boolean;

  @Column()
  photos: string;

  @ManyToOne((type) => User, (user) => user.properties, { eager: false })
  user: User;

  @Column()
  userId: number;
}
