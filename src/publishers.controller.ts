import {
  Controller,
  Get,
  Post,
  Delete,
  Put,
  UseGuards,
  UseFilters,
} from '@nestjs/common';

import { PublishersGuard } from 'src/guards';
import { ApiExceptionFilter } from 'src/lib/exceptions/api-exception.filter';

@Controller('/publishers')
@UseFilters(new ApiExceptionFilter())
export class PublishersController {
  constructor() {}

  @Post('/login')
  login() {}

  @Get('/:publisherId')
  getPublisher() {}

  @Get('/:publisherId/articles')
  getPublisherArticles() {}

  @Post('/articles')
  @UseGuards(PublishersGuard)
  createArticle() {}

  @Delete('/articles/:articleId')
  @UseGuards(PublishersGuard)
  deleteArticle() {}

  @Put('/articles/:articleId')
  @UseGuards(PublishersGuard)
  updateArticle() {}

  @Get('/articlesReported')
  @UseGuards(PublishersGuard)
  getReportedArticles() {}

  @Post('/articlesReported/:articleId')
  @UseGuards(PublishersGuard)
  reportArticle() {}

  @Delete('/articlesReported/:articleId')
  @UseGuards(PublishersGuard)
  undoReportArticle() {}
}

/*
POST /publishers/login

GET /publishers/:publisherId (All)
GET /publishers/:publisherId/articles (All)

POST /publishers/articles
DELETE /publishers/articles/:articleId
PUT /publishers/articles/:articleId

GET /publishers/articlesReported (Publisher)
POST /publishers/articlesReported/:articleId (Publisher)
DELETE /publishers/articlesReported/:articleId (Publisher)
*/
