import {
  Controller,
  Post,
  forwardRef,
  Inject,
  UseGuards,
  UseFilters,
} from '@nestjs/common';

import { ArticlesService } from 'src/modules/articles/articles.service';
import { PublishersApiGuard } from 'src/guards';
import { ApiExceptionFilter } from 'src/lib/exceptions/api-exception.filter';

@Controller('/publishersApi')
@UseFilters(new ApiExceptionFilter())
@UseGuards(PublishersApiGuard)
export class PublishersApiController {
  constructor(
    @Inject(forwardRef(() => ArticlesService))
    private readonly articlesService: ArticlesService,
  ) {}

  @Post('/articles')
  updateOrCreateArticle() {}
}

/*

POST /articles

*/
