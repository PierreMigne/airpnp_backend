import { Property } from 'src/properties/entities/property.entity';
import { User } from '../../auth/entities/user.entity';
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Image extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  file: string | null;

  @ManyToOne(() => Property, (property) => property.images, {
    eager: false,
    onDelete: 'CASCADE',
  })
  property: Property | null;

  @OneToOne(() => User, (user) => user.image, {
    eager: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user: User | null;
}
