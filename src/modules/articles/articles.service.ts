import { Model } from 'mongoose';

import { InjectModel } from '@nestjs/mongoose';
import { ArticleDocument, Article } from 'src/schemas/article.schema';

import config from 'src/lib/config';
import { ApiException } from 'src/lib/exceptions/api.exception';
import ErrorCode from 'src/lib/error-code';

export class ArticlesService {
  constructor(
    @InjectModel(Article.name)
    private readonly ArticleModel: Model<ArticleDocument>,
  ) {}

  async getArticlesFromRegionIds(
    regionIds,
    page,
    perPage = config.defaultPerPage,
  ) {
    const articles = await this.ArticleModel.find({
      region: { $in: regionIds },
    })
      .skip(page * perPage)
      .limit(perPage);

    return articles;
  }

  async checkifArticleExists(articleId) {
    const article = await this.ArticleModel.findById(articleId);

    if (!article) {
      throw new ApiException(ErrorCode.ARTICLE_DOES_NOT_EXIST, 409);
    }

    return true;
  }

  async getArticlesByIds(ids, page, perPage = config.defaultPerPage) {
    const articles = await this.ArticleModel.find({
      _id: { $in: ids },
    })
      .skip(page * perPage)
      .limit(perPage);

    return articles;
  }
}
