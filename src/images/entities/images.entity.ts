import { Property } from 'src/properties/entities/property.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Image {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('varchar', {})
  file: string | null;

  @Column('int')
  propertyId: number | null;

  @ManyToOne(() => Property, { onDelete: 'CASCADE', onUpdate: 'NO ACTION' })
  @JoinColumn([{ name: 'property', referencedColumnName: 'id' }])
  property: Property;
}
