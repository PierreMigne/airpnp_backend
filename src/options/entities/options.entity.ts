import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Property } from '../../properties/entities/property.entity';

@Entity()
export class Option extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  options: string;

  @Column()
  propertyId: number;

  @ManyToOne(() => Property, (property) => property.options, {
    eager: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  property: Property;
}
