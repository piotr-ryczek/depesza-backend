import { Model } from 'mongoose';

import { InjectModel } from '@nestjs/mongoose';
import { RegionDocument, Region } from 'src/schemas/region.schema';

export class RegionsService {
  constructor(
    @InjectModel(Region.name)
    private readonly RegionModel: Model<RegionDocument>,
  ) {}
}
