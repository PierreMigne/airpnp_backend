import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { AuthSignUpDto } from '../auth/dto/auth-signUp.dto';
import * as dotenv from 'dotenv';
import { JwtPayload } from '../auth/jwt-payload.interface';

dotenv.config();

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}
  urlServer = process.env.URL_URL;

  async sendUserWelcome(user: AuthSignUpDto) {
    const url = this.urlServer + 'profile';
    await this.mailerService.sendMail({
      to: user.email,
      // from: '"Support Team" <support@example.com>', // override default from
      subject: "Bienvenue sur Loc A'Part !",
      template: './welcome', // `.hbs` extension is appended automatically
      context: {
        name: user.firstname,
        url,
      },
    });
  }

  async sendUserForgotPassword(email: string, accessToken: string) {
    const url = this.urlServer + 'reset/' + accessToken;
    await this.mailerService.sendMail({
      to: email,
      // from: '"Support Team" <support@example.com>', // override default from
      subject: "Oubli de mot de passe Loc A'Part !",
      template: './forgot', // `.hbs` extension is appended automatically
      context: {
        url,
      },
    });
  }

  async sendUserValidProperty(email: string, firstname: string) {
    const url = this.urlServer + 'my-properties';
    await this.mailerService.sendMail({
      to: email,
      // from: '"Support Team" <support@example.com>', // override default from
      subject: "Votre hébergement est en ligne sur Loc A'Part !",
      template: './validProperty', // `.hbs` extension is appended automatically
      context: {
        url,
        name: firstname,
      },
    });
  }

  async sendUserInvalidProperty(email: string, firstname: string, reasons: string[]) {
    const url = this.urlServer + 'my-properties';
    await this.mailerService.sendMail({
      to: email,
      // from: '"Support Team" <support@example.com>', // override default from
      subject: "Problème sur votre hébergement Loc A'Part !",
      template: './invalidProperty', // `.hbs` extension is appended automatically
      context: {
        url,
        name: firstname,
        reasons,
      },
    });
  }
}
