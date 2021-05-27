import { IsNotEmpty } from 'class-validator';

export class CreateBookingDto {
  @IsNotEmpty()
  startDate: Date;

  @IsNotEmpty()
  endDate: Date;

  @IsNotEmpty()
  peoples: number;

  @IsNotEmpty()
  price: number;
}
