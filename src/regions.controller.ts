import { Controller, Get } from '@nestjs/common';

@Controller()
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
