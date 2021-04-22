import { IsIn, IsNotEmpty, IsOptional } from 'class-validator';
import { PropertyCategories } from '../property-categories.enum';

export class GetPropertiesFilterDto {
  @IsOptional()
  @IsIn([
    PropertyCategories.APPARTEMENT,
    PropertyCategories.MAISON,
    PropertyCategories.VILLA,
  ])
  category: PropertyCategories;

  @IsOptional()
  @IsNotEmpty()
  search: string;
}
