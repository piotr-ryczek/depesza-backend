import {
  Controller,
  Post,
  forwardRef,
  Inject,
  UseGuards,
  UseFilters,
  Headers,
  Body,
} from '@nestjs/common';

import { ArticlesService } from 'src/modules/articles/articles.service';
import { PublishersApiGuard } from 'src/guards';
import { ApiExceptionFilter } from 'src/lib/exceptions/api-exception.filter';
import { WordpressArticlePayloadDto } from './types/dtos';

@Controller('/publishersApi')
@UseFilters(new ApiExceptionFilter())
@UseGuards(PublishersApiGuard)
export class PublishersApiController {
  constructor(
    @Inject(forwardRef(() => ArticlesService))
    private readonly articlesService: ArticlesService,
  ) {}

  @Post('/articles')
  async updateOrCreateArticle(
    @Body() payload: WordpressArticlePayloadDto,
    @Headers('publisherId') publisherId: string,
  ) {
    const {
      wordpressId,
      title,
      excerpt,
      content,
      photoUrl,
      regionId,
    } = payload;

    const article = await this.articlesService.createOrUpdateByWordpressId(
      wordpressId,
      publisherId,
      {
        title,
        excerpt,
        content,
        photoUrl,
        regionId,
      },
    );

    return article;
  }
}
