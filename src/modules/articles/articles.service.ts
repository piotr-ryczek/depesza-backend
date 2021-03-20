import { Model, Types, FilterQuery } from 'mongoose';

import { InjectModel } from '@nestjs/mongoose';
import { ArticleDocument, Article } from 'src/schemas/article.schema';

import config from 'src/lib/config';
import { ApiException } from 'src/lib/exceptions/api.exception';
import ErrorCode from 'src/lib/error-code';
import { FilesService } from 'src/modules/files/files.service';
import { EmailNotificationsService } from 'src/modules/email-notifications/email-notifications.service';
import { cleanupHTML } from 'src/lib/helpers';

export class ArticlesService {
  constructor(
    @InjectModel(Article.name)
    private readonly ArticleModel: Model<ArticleDocument>,
    private readonly filesService: FilesService,
    private readonly emailNotificationsService: EmailNotificationsService,
  ) {}

  async createArticle(values) {
    const {
      publisherId,
      title,
      author,
      excerpt,
      content,
      photoFile = null,
      regionId,
      isPublished,
    } = values;

    const newArticle = new this.ArticleModel({
      publishedBy: new Types.ObjectId(publisherId),
      title,
      author,
      excerpt: cleanupHTML(excerpt),
      content: cleanupHTML(content),
      region: new Types.ObjectId(regionId),
      createdAt: new Date(),
      isPublished,
    });

    if (photoFile) {
      const photoUrl = await this.filesService.uploadFile(photoFile);

      Object.assign(newArticle, {
        photoUrl,
      });
    }

    await newArticle.save();

    return newArticle;
  }

  async updateArticle(articleId, publisherId, values) {
    const {
      title,
      author,
      excerpt,
      content,
      photoFile = null,
      regionId,
      isPublished,
    } = values;

    const article = await this.ArticleModel.findOne({
      _id: new Types.ObjectId(articleId),
      publishedBy: new Types.ObjectId(publisherId),
    });

    if (!article) {
      throw new ApiException(ErrorCode.ARTICLE_DOES_NOT_EXIST, 409);
    }

    Object.assign(article, {
      title,
      author,
      excerpt: cleanupHTML(excerpt),
      content: cleanupHTML(content),
      region: new Types.ObjectId(regionId),
      isPublished,
    });

    if (photoFile) {
      const photoUrl = await this.filesService.uploadFile(photoFile);

      Object.assign(article, {
        photoUrl,
      });
    }

    await article.save();

    return article;
  }

  async createOrUpdateByWordpressId(wordpressId, publisherId, values) {
    const { title, excerpt, content, photoUrl = null, regionId } = values;

    const commonPayload = {
      title,
      excerpt: cleanupHTML(excerpt),
      content: cleanupHTML(content),
      region: new Types.ObjectId(regionId),
    };

    const maybeFoundArticle = await this.ArticleModel.findOne({
      wordpressId,
      publishedBy: new Types.ObjectId(publisherId),
    });

    const article = (() => {
      // Update
      if (maybeFoundArticle) {
        Object.assign(maybeFoundArticle, commonPayload);

        return maybeFoundArticle;
      }

      // Create
      const newArticle = new this.ArticleModel({
        ...commonPayload,
        publishedBy: new Types.ObjectId(publisherId),
        createdAt: new Date(),
        wordpressId,
        isPublished: false,
      });

      return newArticle;
    })();

    const { lastWordpressPhotoUrl } = article;

    if (photoUrl && lastWordpressPhotoUrl !== photoUrl) {
      const uploadPhotoUrl = await this.filesService.retrieveAndUploadFileFromUrl(
        photoUrl,
      );

      Object.assign(article, {
        photoUrl: uploadPhotoUrl,
        lastWordpressPhotoUrl: photoUrl,
      });
    }

    await article.save();

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

  async queryArticles({
    findQuery = {},
    page,
    perPage,
    withCount = false,
    onlyAccessible = true,
  }: {
    page: number;
    perPage: number;
    findQuery?: FilterQuery<Article>;
    withCount?: boolean;
    onlyAccessible?: boolean; // Published and not reported by 2 or more publishers
  }) {
    const finalFindQuery = findQuery;

    if (onlyAccessible) {
      Object.assign(finalFindQuery, {
        reportedByLength: { $lt: 3 },
        isPublished: true,
      });
    }

    const articles = await this.ArticleModel.find(finalFindQuery)
      .sort({ createdAt: -1 })
      .skip((page - 1) * perPage)
      .limit(+perPage)
      .populate({
        path: 'publishedBy',
        select: '_id name author logoUrl patroniteUrl',
      })
      .populate('region');

    const response = {
      articles,
      countAll: false,
    };

    if (withCount) {
      const countAll = await this.ArticleModel.countDocuments(finalFindQuery);

      Object.assign(response, {
        countAll,
      });
    }

    return response;
  }

  async getArticle(articleId) {
    const article = await this.ArticleModel.findById(articleId)
      .populate('region')
      .populate({
        path: 'publishedBy',
        select: '_id name author logoUrl patroniteUrl',
      });

    return article;
  }

  async getArticles(page, perPage, withCount = false) {
    const { articles, countAll } = await this.queryArticles({
      page,
      perPage,
      withCount,
    });

    return {
      articles,
      countAll,
    };
  }

  async getArticlesFromRegionIds(
    regionIds,
    page,
    perPage = config.defaultPerPage,
    withCount = false,
  ) {
    const { articles, countAll } = await this.queryArticles({
      findQuery: { region: { $in: regionIds } },
      page,
      perPage,
      withCount,
    });

    return {
      articles,
      countAll,
    };
  }

  async getArticlesFromRegion(
    regionId,
    page,
    perPage = config.defaultPerPage,
    withCount = false,
  ) {
    const { articles, countAll } = await this.queryArticles({
      findQuery: { region: new Types.ObjectId(regionId) },
      page,
      perPage,
      withCount,
    });

    return {
      articles,
      countAll,
    };
  }

  async getPublisherArticles({
    publisherId,
    page,
    perPage,
    withCount = false,
    onlyAccessible = true,
  }: {
    publisherId: string;
    page: number;
    perPage: number;
    withCount?: boolean;
    onlyAccessible?: boolean;
  }) {
    const { articles, countAll } = await this.queryArticles({
      findQuery: { publishedBy: new Types.ObjectId(publisherId) },
      page,
      perPage,
      withCount,
      onlyAccessible,
    });

    return {
      articles,
      countAll,
    };
  }

  async checkifArticleExists(articleId) {
    const article = await this.ArticleModel.findById(articleId);

    if (!article) {
      throw new ApiException(ErrorCode.ARTICLE_DOES_NOT_EXIST, 409);
    }

    return true;
  }

  async getArticlesByIds({
    ids,
    page,
    perPage = config.defaultPerPage,
    withCount = false,
    onlyAccessible = true,
  }: {
    ids: string[] | Types.ObjectId[];
    page: number;
    perPage?: number;
    withCount?: boolean;
    onlyAccessible?: boolean;
  }) {
    const { articles, countAll } = await this.queryArticles({
      findQuery: { _id: { $in: ids } },
      page,
      perPage,
      withCount,
      onlyAccessible,
    });

    return {
      articles,
      countAll,
    };
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

  // async sendArticleToEmail(articleId, email) {
  //   const article = await this.ArticleModel.findById(articleId);

  //   if (!article) {
  //     throw new ApiException(ErrorCode.ARTICLE_DOES_NOT_EXIST, 409);
  //   }

  //   const { title, content } = article;

  //   const htmlContent = `
  //   <html>
  //     <head>
  //       <meta charset="utf-8">
  //       <title>${title}</title>
  //     </head>
  //     <body>
  //       ${content}
  //     </body>
  //   </html>
  // `;

  //   await this.emailNotificationsService.sendEmailWithAttachment(
  //     email,
  //     title,
  //     '',
  //     `${title}.html`,
  //     htmlContent,
  //   );

  //   return true;
  // }
}
