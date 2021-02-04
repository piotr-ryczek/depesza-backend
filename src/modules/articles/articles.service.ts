import { Model } from 'mongoose';

import { InjectModel } from '@nestjs/mongoose';
import { ArticleDocument, Article } from 'src/schemas/article.schema';

export class ArticlesService {
  constructor(
    @InjectModel(Article.name)
    private readonly ArticleModel: Model<ArticleDocument>,
  ) {}
}
