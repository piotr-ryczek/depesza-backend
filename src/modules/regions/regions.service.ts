import { Model } from 'mongoose';

import { InjectModel } from '@nestjs/mongoose';
import { RegionDocument, Region } from 'src/schemas/region.schema';
import { ApiException } from 'src/lib/exceptions/api.exception';
import ErrorCode from 'src/lib/error-code';

export class RegionsService {
  constructor(
    @InjectModel(Region.name)
    private readonly RegionModel: Model<RegionDocument>,
  ) {}

  async checkIfRegionExists(regionId) {
    const region = await this.RegionModel.findById(regionId);

    if (!region) {
      throw new ApiException(ErrorCode.REGION_DOES_NOT_EXIST, 409);
    }

    return true;
  }

  async getRegion(regionId) {
    const region = await this.RegionModel.findById(regionId);

    return region;
  }

  async getRegions() {
    const regions = await this.RegionModel.find({});

    return regions;
  }
}
