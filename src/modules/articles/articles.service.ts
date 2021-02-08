import { Model, Types } from 'mongoose';

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
      excerpt,
      content,
      photoFile = null,
      regionId,
    } = values;

    const newArticle = new this.ArticleModel({
      publishedBy: new Types.ObjectId(publisherId),
      title,
      excerpt,
      content,
      region: new Types.ObjectId(regionId),
      createdAt: new Date(),
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
    const { title, excerpt, content, photoFile = null, regionId } = values;

    const article = await this.ArticleModel.findOne({
      _id: new Types.ObjectId(articleId),
      publishedBy: new Types.ObjectId(publisherId),
    });

    if (!article) {
      throw new ApiException(ErrorCode.ARTICLE_DOES_NOT_EXIST, 409);
    }

    Object.assign(article, {
      title,
      excerpt,
      content,
      region: new Types.ObjectId(regionId),
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

  async queryArticles(findQuery, page, perPage, withCount = false) {
    const articles = await this.ArticleModel.find({
      ...findQuery,
      reportedByLength: { $lt: 3 },
    })
      .skip((page - 1) * perPage)
      .limit(+perPage)
      .populate({
        path: 'publishedBy',
        select: '_id name logoUrl patroniteUrl',
      })
      .populate('region');

    const response = {
      articles,
      countAll: false,
    };

    if (withCount) {
      const countAll = await this.ArticleModel.countDocuments({
        ...findQuery,
        reportedByLength: { $lt: 3 },
      });

      Object.assign(response, {
        countAll,
      });
    }

    return response;
  }

  async getArticle(articleId) {
    const article = await this.ArticleModel.findById(articleId).populate(
      'region',
    );

    return article;
  }

  async getArticles(page, perPage) {
    const { articles } = await this.queryArticles({}, page, perPage);

    return articles;
  }

  async getArticlesFromRegionIds(
    regionIds,
    page,
    perPage = config.defaultPerPage,
  ) {
    const { articles } = await this.queryArticles(
      { region: { $in: regionIds } },
      page,
      perPage,
    );

    return articles;
  }

  async getArticlesFromRegion(regionId, page, perPage = config.defaultPerPage) {
    const { articles } = await this.queryArticles(
      { region: new Types.ObjectId(regionId) },
      page,
      perPage,
    );

    return articles;
  }

  async getPublisherArticles(publisherId, page, perPage, withCount = false) {
    const { articles, countAll } = await this.queryArticles(
      { publishedBy: new Types.ObjectId(publisherId) },
      page,
      perPage,
      withCount,
    );

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
