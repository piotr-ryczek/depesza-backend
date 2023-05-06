import {
  Controller,
  Get,
  UseFilters,
  Inject,
  forwardRef,
  Param,
  Query,
} from '@nestjs/common';

import { ApiExceptionFilter } from 'src/lib/exceptions/api-exception.filter';
import { RegionsService } from 'src/modules/regions/regions.service';
import { ArticlesService } from 'src/modules/articles/articles.service';
import { ArticlesBasicQueryDto } from 'src/types/dtos/shared';

@Controller('/regions')
@UseFilters(new ApiExceptionFilter())
export class RegionsController {
  constructor(
    @Inject(forwardRef(() => RegionsService))
    private readonly regionsService: RegionsService,
    @Inject(forwardRef(() => ArticlesService))
    private readonly articlesService: ArticlesService,
  ) {}

  @Get()
  async getRegions() {
    const regions = await this.regionsService.getRegions();

    return {
      regions,
    };
  }

  @Get('/:regionId')
  async getRegion(@Param('regionId') regionId: string) {
    const region = await this.regionsService.getRegion(regionId);

    return {
      region,
    };
  }

  @Get('/:regionId/articles')
  async getArticlesForRegion(
    @Param('regionId') regionId: string,
    @Query() query: ArticlesBasicQueryDto,
  ) {
    const { page, perPage } = query;

    const { articles } = await this.articlesService.getArticlesFromRegion(
      regionId,
      +page,
      +perPage,
    );

    return {
      articles,
    };
  }
}
