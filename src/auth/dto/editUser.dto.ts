import { IsDateString, IsString, MaxLength } from 'class-validator';

export class EditUserDto {
  @IsString()
  @MaxLength(50, {
    message: 'Votre prénom doit contenir au maximum 50 caractères.',
  })
  firstname: string;

  @IsString()
  @MaxLength(50, {
    message: 'Votre nom doit contenir au maximum 50 caractères.',
  })
  lastname: string;

  @IsDateString()
  birthDate: Date;
}
