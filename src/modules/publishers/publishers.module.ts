import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Publisher, PublisherSchema } from 'src/schemas/publisher.schema';

import { PublishersService } from './publishers.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Publisher.name, schema: PublisherSchema },
    ]),
  ],
  providers: [PublishersService],
  exports: [PublishersService],
})
export class PublishersModule {}
