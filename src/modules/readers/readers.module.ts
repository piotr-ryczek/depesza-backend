import { Algorithm } from 'jsonwebtoken';

import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';

import { Reader, ReaderSchema } from 'src/schemas/reader.schema';
import { ArticlesModule } from 'src/modules/articles/articles.module';
import { RegionsModule } from 'src/modules/regions/regions.module';

import { ReadersService } from './readers.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Reader.name, schema: ReaderSchema }]),
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
  ],
  providers: [ReadersService],
  exports: [ReadersService],
})
export class ReadersModule {}
