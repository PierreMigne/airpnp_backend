import { BadRequestException, PipeTransform } from '@nestjs/common';
import { PropertyCategories } from '../property-categories.enum';

export class PropertyCategoriesValidationPipe implements PipeTransform {
  readonly allowedCategories = [
    PropertyCategories.APPARTEMENT,
    PropertyCategories.MAISON,
    PropertyCategories.VILLA,
  ];

  transform(value: any) {
    value = value.toUpperCase();
    if (!this.isCategoriesValid(value)) {
      throw new BadRequestException(`${value} n'est pas une catégorie valide.`);
    }
    return value;
  }

  private isCategoriesValid(category: any) {
    const idx = this.allowedCategories.indexOf(category);
    return idx !== -1;
  }
}
