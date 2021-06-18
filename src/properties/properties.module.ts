import { Module } from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { PropertiesController } from './properties.controller';
import { PropertyRepository } from './property.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { ImageRepository } from '../images/images.repository';
import { FavoriteRepository } from '../favorites/favorties.repository';
import { BookingRepository } from '../booking/bookings.repository';
import { OptionRepository } from '../options/options.repository';
import { MailService } from '../mail/mail.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PropertyRepository,
      ImageRepository,
      FavoriteRepository,
      BookingRepository,
      OptionRepository,
    ]),
    AuthModule,
  ],
  controllers: [PropertiesController],
  providers: [PropertiesService, MailService],
})
export class PropertiesModule {}
