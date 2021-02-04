import { Controller, Get, forwardRef, Inject } from '@nestjs/common';

import { ArticlesService } from 'src/modules/articles/articles.service';

@Controller('/articles')
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
