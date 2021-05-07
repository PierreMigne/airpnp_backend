import { IsEnum, IsNotEmpty } from 'class-validator';
import { PropertyCategories } from '../property-categories.enum';

export class CreatePropertyDto {
  @IsNotEmpty()
  title: string;

  @IsEnum(PropertyCategories)
  category: PropertyCategories;

  @IsNotEmpty()
  location: string;

  @IsNotEmpty()
  surface: number;

  @IsNotEmpty()
  peoples: number;

  @IsNotEmpty()
  beds: number;

  @IsNotEmpty()
  description: string;

  options: string[];

  @IsNotEmpty()
  price: number;

  // @IsNotEmpty()
  // photos: string;
}
