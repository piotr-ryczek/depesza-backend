import { Controller, Get, UseFilters } from '@nestjs/common';

import { ApiExceptionFilter } from 'src/lib/exceptions/api-exception.filter';

@Controller()
@UseFilters(new ApiExceptionFilter())
export class RegionsController {
  constructor() {}

  @Get()
  getRegions() {}

  @Get('/:regionId/articles')
  getArticlesForRegion() {}
}

/*
GET /regions (All)
GET /regions/:regionId/articles (All)
*/
