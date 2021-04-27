import { IsOptional } from 'class-validator';
import { PropertyCategories } from '../property-categories.enum';

export class GetPropertiesFilterDto {
  @IsOptional()
  category: PropertyCategories;

  @IsOptional()
  search: string;

  @IsOptional()
  peoples: number;
}
