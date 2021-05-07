import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/typeorm.config';
import { PropertiesModule } from './properties/properties.module';
import { AuthModule } from './auth/auth.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
    }),
    // ServeStaticModule.forRoot({
    //   rootPath: join(__dirname, '..', 'uploads'),
    //   serveRoot: 'uploads',
    // }),
    PropertiesModule,
    AuthModule,
  ],
})
export class AppModule {}
