import { Model } from 'mongoose';

import { InjectModel } from '@nestjs/mongoose';
import { PublisherDocument, Publisher } from 'src/schemas/publisher.schema';

export class PublishersService {
  constructor(
    @InjectModel(Publisher.name)
    private readonly PublisherModel: Model<PublisherDocument>,
  ) {}
}
