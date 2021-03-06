import { BaseEntity, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { PropertyCategories } from '../property-categories.enum';
import { User } from '../../auth/entities/user.entity';
import { Image } from '../../images/entities/images.entity';
import { Favorite } from 'src/favorites/entities/favorites.entity';
import { Option } from 'src/options/entities/options.entity';
import { PropertyStatus } from '../property-status.enum';

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

  @OneToMany(() => Option, (option) => option.property, {
    eager: true,
    cascade: true,
  })
  options: Option[];

  @Column()
  price: number;

  @Column()
  createdAt: Date;

  @Column()
  status: PropertyStatus;

  @OneToMany(() => Image, (image) => image.property, {
    eager: true,
    cascade: true,
  })
  images: Image[];

  @ManyToOne(() => User, (user) => user.properties, { eager: false })
  user: User;

  @OneToMany(() => Favorite, (favorite) => favorite.property, { eager: true })
  favorites: Favorite[];

  @Column()
  userId: number;
}
