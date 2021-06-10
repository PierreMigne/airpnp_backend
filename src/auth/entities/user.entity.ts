import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Property } from '../../properties/entities/property.entity';
import { Image } from '../../images/entities/images.entity';
import { Favorite } from 'src/favorites/entities/favorites.entity';

@Entity()
@Unique(['email'])
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  firstname: string;

  @Column()
  lastname: string;

  @Column()
  birthDate: Date;

  @Column()
  password: string;

  @Column()
  salt: string;

  @Column()
  isAdmin: boolean;

  @OneToMany(() => Property, (property) => property.user, { eager: true })
  properties: Property[];

  @OneToOne(() => Image, (image) => image.user, { eager: true, cascade: true })
  image: Image;

  @OneToMany(() => Favorite, (favorite) => favorite.user, { eager: true })
  favorites: Favorite[];

  async validatePassword(password: string): Promise<boolean> {
    const hash = await bcrypt.hash(password, this.salt);
    return hash === this.password;
  }
}
