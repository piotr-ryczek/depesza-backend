import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { Algorithm } from 'jsonwebtoken';

import { Reader, ReaderSchema } from 'src/schemas/reader.schema';

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
  ],
  providers: [ReadersService],
  exports: [ReadersService],
})
export class ReadersModule {}
