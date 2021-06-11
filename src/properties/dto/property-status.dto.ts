import { IsEnum, IsNotEmpty } from 'class-validator';
import { PropertyStatus } from '../property-status.enum';

export class PropertyStatusDto {
  @IsNotEmpty()
  @IsEnum(PropertyStatus)
  status: PropertyStatus;
}
