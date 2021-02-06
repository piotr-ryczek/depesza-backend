import { Model, Types } from 'mongoose';

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

  async createArticle(values) {
    const {
      publisherId,
      title,
      excerpt,
      content,
      photoUrl = null,
      regionId,
      wordpressId = null,
    } = values;

    const newArticle = new this.ArticleModel({
      publishedBy: new Types.ObjectId(publisherId),
      title,
      excerpt,
      content,
      photoUrl,
      region: new Types.ObjectId(regionId),
      wordpressId,
    });

    await newArticle.save();

    return newArticle;
  }

  async updateArticle(articleId, publisherId, values) {
    const {
      title,
      excerpt,
      content,
      photoUrl = null,
      regionId,
      wordpressId = null,
    } = values;

    const article = await this.ArticleModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(articleId),
        publishedBy: new Types.ObjectId(publisherId),
      },
      {
        title,
        excerpt,
        content,
        photoUrl,
        region: new Types.ObjectId(regionId),
        wordpressId,
      },
      {
        new: true,
      },
    );

    if (!article) {
      throw new ApiException(ErrorCode.ARTICLE_HAS_NOT_BEEN_UPDATED, 409);
    }

    return article;
  }

  async deleteArticle(publisherId, articleId) {
    const result = await this.ArticleModel.findOneAndRemove({
      _id: new Types.ObjectId(articleId),
      publishedBy: new Types.ObjectId(publisherId),
    });

    if (!result) {
      throw new ApiException(ErrorCode.ARTICLE_HAS_NOT_BEEN_DELETED, 409);
    }
  }

  async queryArticles(findQuery, page, perPage) {
    const articles = await this.ArticleModel.find({
      ...findQuery,
      reportedByLength: { $lt: 3 },
    })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .populate({
        path: 'publishedBy',
        select: '_id name logoUrl patroniteUrl',
      });

    return articles;
  }

  async getArticle(articleId) {
    const article = await this.ArticleModel.findById(articleId);

    return article;
  }

  async getArticles(page, perPage) {
    const articles = await this.queryArticles({}, page, perPage);

    return articles;
  }

  async getArticlesFromRegionIds(
    regionIds,
    page,
    perPage = config.defaultPerPage,
  ) {
    const articles = await this.queryArticles(
      { region: { $in: regionIds } },
      page,
      perPage,
    );

    return articles;
  }

  async getArticlesFromRegion(regionId, page, perPage = config.defaultPerPage) {
    const articles = await this.queryArticles(
      { region: new Types.ObjectId(regionId) },
      page,
      perPage,
    );

    return articles;
  }

  async getPublisherArticles(publisherId, page, perPage) {
    const articles = await this.queryArticles(
      { publishedBy: new Types.ObjectId(publisherId) },
      page,
      perPage,
    );

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
      .skip((page - 1) * perPage)
      .limit(perPage);

    return articles;
  }

  async checkIfPublisherHasArticle(publisherId, articleId) {
    const article = await this.ArticleModel.findOne({
      _id: new Types.ObjectId(articleId),
      publishedBy: new Types.ObjectId(publisherId),
    });

    return !!article;
  }

  async reportBy(articleId, publisherId) {
    await this.ArticleModel.findByIdAndUpdate(
      articleId,
      {
        $push: { reportedBy: new Types.ObjectId(publisherId) },
        $inc: { reportedByLength: 1 },
      },
      {
        new: true,
      },
    );
  }

  async undoReportBy(articleId, publisherId) {
    await this.ArticleModel.findByIdAndUpdate(
      articleId,
      {
        $pull: { reportedBy: new Types.ObjectId(publisherId) },
        $inc: { reportedByLength: -1 },
      },
      {
        new: true,
      },
    );
  }
}
