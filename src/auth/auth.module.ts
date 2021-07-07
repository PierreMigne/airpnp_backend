import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { UserRepository } from './user.repository';
import { ImageRepository } from '../images/images.repository';
import { FavoriteRepository } from '../favorites/favorties.repository';
import { BookingRepository } from '../booking/bookings.repository';
import { MailModule } from '../mail/mail.module';
import * as dotenv from 'dotenv';

dotenv.config();

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: 86400 }, // 86400 => 24 hours
    }),
    TypeOrmModule.forFeature([UserRepository, ImageRepository, FavoriteRepository, BookingRepository]),
    MailModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [JwtStrategy, PassportModule],
})
export class AuthModule {}
