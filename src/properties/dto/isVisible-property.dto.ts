import { IsEnum, IsNotEmpty } from 'class-validator';
import { PropertyCategories } from '../property-categories.enum';

export class IsVisiblePropertyDto {
  isVisible: boolean;
}
