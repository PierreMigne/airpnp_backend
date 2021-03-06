import { IsDateString, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class AuthSignUpDto {
  @IsString()
  @MaxLength(50, {
    message: 'Votre email doit contenir au maximum 50 caractères.',
  })
  email: string;

  @IsString()
  @MinLength(6, {
    message: 'Votre mot de passe doit contenir au minimum 6 caractères.',
  })
  @MaxLength(20, {
    message: 'Votre mot de passe doit contenir au maximum 20 caractères.',
  })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Votre mot de passe doit contenir au minimum 1 Majuscule, 1 Minuscule et 1 Chiffre ou caractère spécial.',
  })
  password: string;

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
