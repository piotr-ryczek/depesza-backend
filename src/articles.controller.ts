import {
  Controller,
  Get,
  forwardRef,
  Inject,
  UseFilters,
  Query,
  Param,
} from '@nestjs/common';

import { ArticlesService } from 'src/modules/articles/articles.service';
import { ApiExceptionFilter } from 'src/lib/exceptions/api-exception.filter';
import { ArticlesBasicQueryDto } from 'src/types/dtos/shared';

@Controller('/articles')
@UseFilters(new ApiExceptionFilter())
export class ArticlesController {
  constructor(
    @Inject(forwardRef(() => ArticlesService))
    private readonly articlesService: ArticlesService,
  ) {}

  @Get()
  async getArticles(@Query() query: ArticlesBasicQueryDto) {
    const { page, perPage } = query;
    const { articles } = await this.articlesService.getArticles(
      +page,
      +perPage,
    );

    return {
      articles,
    };
  }

  @Get('/:articleId')
  async getArticle(@Param('articleId') articleId: string) {
    const article = await this.articlesService.getArticle(articleId);

    return {
      article,
    };
  }
}
