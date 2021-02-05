import {
  Controller,
  Get,
  forwardRef,
  Inject,
  UseFilters,
} from '@nestjs/common';

import { ArticlesService } from 'src/modules/articles/articles.service';
import { ApiExceptionFilter } from 'src/lib/exceptions/api-exception.filter';

@Controller('/articles')
@UseFilters(new ApiExceptionFilter())
export class ArticlesController {
  constructor(
    @Inject(forwardRef(() => ArticlesService))
    private readonly articlesService: ArticlesService,
  ) {}

  @Get()
  getArticles() {}

  @Get('/:articleId')
  getArticle() {}
}

/*

GET /articles (All - wszystkie artykuły)
GET /articles/:articleId (All - jeden artykuł)
*/
