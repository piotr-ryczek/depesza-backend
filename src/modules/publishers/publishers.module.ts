import { Algorithm } from 'jsonwebtoken';

import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';

import { ArticlesModule } from 'src/modules/articles/articles.module';
import { Publisher, PublisherSchema } from 'src/schemas/publisher.schema';
import { FilesModule } from 'src/modules/files/files.module';
import { PublishersService } from './publishers.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Publisher.name, schema: PublisherSchema },
    ]),
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_SECRET,
        signOptions: {
          algorithm: process.env.JWT_ALGORITHM as Algorithm,
        },
      }),
    }),
    forwardRef(() => ArticlesModule),
    FilesModule,
  ],
  providers: [PublishersService],
  exports: [PublishersService],
})
export class PublishersModule {}
