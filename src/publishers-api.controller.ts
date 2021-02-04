import {
  Controller,
  Post,
  forwardRef,
  Inject,
  UseGuards,
} from '@nestjs/common';

import { ArticlesService } from 'src/modules/articles/articles.service';
import { PublishersApiGuard } from 'src/guards';

@Controller('/publishersApi')
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
