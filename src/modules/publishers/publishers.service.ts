import { randomBytes } from 'crypto';
import { Model, Types } from 'mongoose';
import * as speakeasy from 'speakeasy';
import * as bcrypt from 'bcryptjs';

import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable, Inject, forwardRef } from '@nestjs/common';

import {
  validatePassword,
  objectIdsIncludes,
  filterObjectIdsFrom,
} from 'src/lib/helpers';
import { PublisherDocument, Publisher } from 'src/schemas/publisher.schema';
import { ApiException } from 'src/lib/exceptions/api.exception';
import ErrorCode from 'src/lib/error-code';
import { ArticlesService } from 'src/modules/articles/articles.service';
import { FilesService } from 'src/modules/files/files.service';

@Injectable()
export class PublishersService {
  constructor(
    @InjectModel(Publisher.name)
    private readonly PublisherModel: Model<PublisherDocument>,
    private readonly jwtService: JwtService,
    @Inject(forwardRef(() => ArticlesService))
    private readonly articlesService: ArticlesService,
    private readonly filesService: FilesService,
  ) {}

  async authorizeApiQuery(apiKey, apiPassword) {
    const publisher = await this.PublisherModel.findOne({
      apiKey,
    });

    if (!publisher) {
      throw new ApiException(ErrorCode.PUBLISHER_DOES_NOT_EXIST, 403);
    }

    const { apiPassword: apiPasswordHash } = publisher;

    if (!bcrypt.compareSync(apiPassword, apiPasswordHash)) {
      throw new ApiException(ErrorCode.INCORRECT_PASSWORD, 403);
    }

    const { _id: publisherId } = publisher;

    return publisherId;
  }

  async login(email: string, password: string, code: string) {
    const publisher = await this.PublisherModel.findOne({
      email: email.toLocaleLowerCase(),
    });

    if (!publisher) {
      throw new ApiException(ErrorCode.PUBLISHER_DOES_NOT_EXIST, 403);
    }

    const {
      password: passwordHash,
      _id: publisherId,
      articlesReported,
    } = publisher;

    // Initial Password Flow
    if (!passwordHash) {
      const { initialCode } = publisher;

      if (initialCode !== password) {
        throw new ApiException(ErrorCode.INITIAL_CODE_INCORRECT, 403);
      }

      const token = this.jwtService.sign(
        {
          publisherId,
          hasPassword: false,
        },
        {
          expiresIn: 60 * 5, // 5 minutes, short lived, only to set up new password
        },
      );

      return {
        token,
        hasPassword: false,
        articlesReported: [],
        publisherId,
      };
    }

    // Normal Login flow

    if (!bcrypt.compareSync(password, passwordHash)) {
      throw new ApiException(ErrorCode.INCORRECT_PASSWORD, 403);
    }

    const { secondFactorSecret } = publisher;

    const codeVerificationResult = speakeasy.totp.verify({
      secret: secondFactorSecret,
      encoding: 'base32',
      token: code,
    });

    if (!codeVerificationResult) {
      throw new ApiException(ErrorCode.INCORRECT_2FA_CODE, 403);
    }

    const token = this.jwtService.sign(
      {
        publisherId,
        hasPassword: true,
      },
      {
        expiresIn: +process.env.JWT_EXPIRES_IN,
      },
    );

    return {
      token,
      hasPassword: true,
      articlesReported,
      publisherId,
    };
  }

  /**
   *
   * @description Also returning current data
   */
  async refreshToken(publisherId) {
    const publisher = await this.PublisherModel.findById(publisherId);

    if (!publisher) {
      throw new ApiException(ErrorCode.PUBLISHER_DOES_NOT_EXIST, 403);
    }

    const { articlesReported } = publisher;

    const token = this.jwtService.sign(
      {
        publisherId,
        hasPassword: true, // Should be true as PublisherGuard securing
      },
      {
        expiresIn: +process.env.JWT_EXPIRES_IN,
      },
    );

    return {
      token,
      hasPassword: true,
      articlesReported,
      publisherId,
    };
  }

  async setPassword({ publisherId, password, repeatPassword }) {
    const publisher = await this.PublisherModel.findById(publisherId);

    if (!publisher) {
      throw new ApiException(ErrorCode.PUBLISHER_DOES_NOT_EXIST, 403);
    }

    const { password: publisherPasswordHash } = publisher;

    if (publisherPasswordHash) {
      throw new ApiException(ErrorCode.PUBLISHER_ALREADY_HAS_PASSWORD, 403);
    }

    validatePassword(password, repeatPassword);

    const passwordHash = await bcrypt.hash(
      password,
      +process.env.PASSWORD_SALT_ROUNDS,
    );

    const { base32 } = speakeasy.generateSecret({
      name: process.env.APP_NAME,
    });

    Object.assign(publisher, {
      password: passwordHash,
      initialCode: null,
      secondFactorSecret: base32,
    });

    await publisher.save();

    const { email } = publisher;

    return {
      secret2FA: base32,
      email,
    };
  }

  async getPublishers() {
    const publishers = await this.PublisherModel.find(
      {},
      '_id name description logoUrl patroniteUrl',
    );

    return publishers;
  }

  async getPublisher(publisherId) {
    const publisher = await this.PublisherModel.findById(
      publisherId,
      '_id name description authors logoUrl patroniteUrl facebookUrl twitterUrl www',
    );

    return publisher;
  }

  async updatePublisher(publisherId, values) {
    const {
      logoFile = null,
      name,
      description,
      authors,
      patroniteUrl,
      facebookUrl,
      twitterUrl,
      www,
    } = values;

    const publisher = await this.PublisherModel.findById(publisherId);

    Object.assign(publisher, {
      name,
      description,
      authors,
      patroniteUrl,
      facebookUrl,
      twitterUrl,
      www,
    });

    if (logoFile) {
      const logoUrl = await this.filesService.uploadFile(logoFile);

      Object.assign(publisher, {
        logoUrl,
      });
    }

    await publisher.save();

    return this.cleanFromCriticalInformation(publisher);
  }

  async getReportedArticles(publisherId, page, perPage, withCount = false) {
    const publisher = await this.PublisherModel.findById(publisherId);

    const articlesReported = publisher.articlesReported as Types.ObjectId[];

    const { articles, countAll } = await this.articlesService.getArticlesByIds({
      ids: articlesReported,
      page,
      perPage,
      withCount,
      onlyAccessible: false,
    });

    return {
      articles,
      countAll,
    };
  }

  async reportArticle(publisherId, articleId) {
    const publisher = await this.PublisherModel.findById(publisherId);

    if (!publisher) {
      throw new ApiException(ErrorCode.PUBLISHER_DOES_NOT_EXIST, 409);
    }

    const ifPublisherHasArticle = await this.articlesService.checkIfPublisherHasArticle(
      publisherId,
      articleId,
    );

    if (ifPublisherHasArticle) {
      throw new ApiException(ErrorCode.CAN_NOT_REPORT_OWN_ARTICLE, 409);
    }

    const { articlesReported } = publisher;

    if (objectIdsIncludes(articlesReported as Types.ObjectId[], articleId)) {
      throw new ApiException(
        ErrorCode.ARTICLE_HAS_BEEN_ALREADY_ADDED_READED,
        409,
      );
    }

    Object.assign(publisher, {
      articlesReported: [...articlesReported, new Types.ObjectId(articleId)],
    });

    await publisher.save();
    await this.articlesService.reportBy(articleId, publisherId);

    return publisher;
  }

  async undoReportArticle(publisherId, articleId) {
    const publisher = await this.PublisherModel.findById(publisherId);

    if (!publisher) {
      throw new ApiException(ErrorCode.PUBLISHER_DOES_NOT_EXIST, 409);
    }

    const { articlesReported } = publisher;

    if (!objectIdsIncludes(articlesReported as Types.ObjectId[], articleId)) {
      throw new ApiException(ErrorCode.LACK_OF_ARTICLE_IN_REPORTED, 409);
    }

    Object.assign(publisher, {
      articlesReported: filterObjectIdsFrom(
        articlesReported as Types.ObjectId[],
        articleId,
      ),
    });

    await publisher.save();
    await this.articlesService.undoReportBy(articleId, publisherId);

    return publisher;
  }

  async createApiCredentials(publisherId, apiPassword) {
    const apiKey = randomBytes(15).toString('hex');

    const apiPasswordHash = await bcrypt.hash(
      apiPassword,
      +process.env.PASSWORD_SALT_ROUNDS,
    );

    const result = await this.PublisherModel.findByIdAndUpdate(publisherId, {
      apiKey,
      apiPassword: apiPasswordHash,
    });

    if (!result) {
      throw new ApiException(ErrorCode.PUBLISHER_HAS_NOT_BEEN_UPDATED, 409);
    }

    return apiKey;
  }

  cleanFromCriticalInformation(publisher: PublisherDocument) {
    const {
      initialCode,
      password,
      secondFactorSecret,
      apiKey,
      apiPassword,
      articlesReported, // Not sure
      createdAt,
      ...rest
    } = publisher;

    return rest;
  }
}
