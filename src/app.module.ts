import { Algorithm } from 'jsonwebtoken';

import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { AdminController } from './admin.controller';
import { PublishersController } from './publishers.controller';
import { ArticlesController } from './articles.controller';
import { ReadersController } from './readers.controller';
import { RegionsController } from './regions.controller';
import { ImagesController } from './images.controller';
import { AppController } from './app.controller';

import { PublishersApiController } from './publishers-api.controller';
import { ArticlesModule } from './modules/articles/articles.module';
import { PublishersModule } from './modules/publishers/publishers.module';
import { RegionsModule } from './modules/regions/regions.module';
import { ReadersModule } from './modules/readers/readers.module';
import { AdminsModule } from './modules/admins/admins.module';
import { FilesModule } from './modules/files/files.module';
import { S3Module } from './modules/s3/s3.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri: process.env.DB_URL,
      }),
    }),
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_SECRET,
        signOptions: {
          algorithm: process.env.JWT_ALGORITHM as Algorithm,
        },
      }),
    }),
    forwardRef(() => ArticlesModule),
    forwardRef(() => RegionsModule),
    forwardRef(() => ReadersModule),
    forwardRef(() => PublishersModule),
    forwardRef(() => AdminsModule),
    forwardRef(() => FilesModule),
    forwardRef(() => S3Module),
  ],
  controllers: [
    AppController,
    AdminController,
    PublishersController,
    ArticlesController,
    ReadersController,
    RegionsController,
    PublishersApiController,
    ImagesController,
  ],
  providers: [],
})
export class AppModule {}
