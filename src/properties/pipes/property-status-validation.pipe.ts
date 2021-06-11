import { BadRequestException, PipeTransform } from '@nestjs/common';
import { PropertyStatus } from '../property-status.enum';

export class PropertyStatusValidationPipe implements PipeTransform {
  readonly allowedStatus = [
    PropertyStatus.VALIDE,
    PropertyStatus.INVALIDE,
    PropertyStatus.ATTENTE,
  ];

  transform(value: any) {
    value = value.toUpperCase();
    if (!this.isStatusValid(value)) {
      throw new BadRequestException(`${value} n'est pas un statut valide.`);
    }
    return value;
  }

  private isStatusValid(status: any) {
    const idx = this.allowedStatus.indexOf(status);
    return idx !== -1;
  }
}
