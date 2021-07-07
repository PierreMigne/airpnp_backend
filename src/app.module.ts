import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/typeorm.config';
import { PropertiesModule } from './properties/properties.module';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './mail/mail.module';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // no need to import into other modules
    }),
    // ServeStaticModule.forRoot({
    //   rootPath: join(__dirname, './', 'front'),
    // }),
    TypeOrmModule.forRoot(typeOrmConfig),
    PropertiesModule,
    AuthModule,
    MailModule,
  ],
})
export class AppModule {}
