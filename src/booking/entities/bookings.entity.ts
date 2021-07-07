import { Property } from 'src/properties/entities/property.entity';
import { User } from '../../auth/entities/user.entity';
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Booking extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @Column()
  peoples: number;

  @Column()
  price: number;

  @Column()
  createdAt: Date;

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
    // onDelete: 'CASCADE',
  })
  // @JoinColumn()
  user: User;
}
