import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { PropertyCategories } from '../property-categories.enum';

export class UpdatePropertyDto {
  @IsOptional()
  title: string;

  @IsEnum(PropertyCategories)
  category: PropertyCategories;

  @IsOptional()
  location: string;

  @IsOptional()
  surface: number;

  @IsOptional()
  peoples: number;

  @IsOptional()
  beds: number;

  @IsOptional()
  description: string;

  @IsOptional()
  options: any;

  @IsOptional()
  price: number;
}
