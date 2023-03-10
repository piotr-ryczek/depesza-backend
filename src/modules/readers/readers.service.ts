import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Inject, forwardRef, Injectable, HttpService } from '@nestjs/common';

import config from 'src/lib/config';
import { ReaderDocument, Reader } from 'src/schemas/reader.schema';
import { ApiException } from 'src/lib/exceptions/api.exception';
import ErrorCode from 'src/lib/error-code';
import {
  emailRegexp,
  objectIdsIncludes,
  filterObjectIdsFrom,
  validatePassword,
} from 'src/lib/helpers';
import { AuthType, ValidationError } from 'src/types';
import { ArticlesService } from 'src/modules/articles/articles.service';
import { RegionsService } from 'src/modules/regions/regions.service';
import { EmailNotificationsService } from 'src/modules/email-notifications/email-notifications.service';
import { ApiValidationException } from 'src/lib/exceptions/api-validation.exception';

@Injectable()
export class ReadersService {
  constructor(
    @InjectModel(Reader.name)
    private readonly ReaderModel: Model<ReaderDocument>,
    private readonly jwtService: JwtService,
    private readonly emailNotificationsService: EmailNotificationsService,
    @Inject(forwardRef(() => ArticlesService))
    private readonly articlesService: ArticlesService,
    @Inject(forwardRef(() => RegionsService))
    private readonly regionsService: RegionsService,
    private httpService: HttpService,
  ) {}

  async findOrCreateFacebookReader({
    facebookId,
    email,
  }: {
    facebookId: string;
    email: string;
  }) {
    const maybeFoundReader = await this.ReaderModel.findOne({
      facebookId,
    });

    if (maybeFoundReader) return maybeFoundReader;

    const newReader = new this.ReaderModel({
      authType: AuthType.FACEBOOK,
      hasAccess: true,
      email: email.toLocaleLowerCase(),
      facebookId,
    });

    await newReader.save();

    return newReader;
  }

  async loginOrRegisterByFacebook(authToken) {
    try {
      const { data } = await this.httpService
        .get(
          `https://graph.facebook.com/me?fields=id,email&access_token=${authToken}`,
        )
        .toPromise();

      const { id: facebookId, email } = data;

      const reader = await this.findOrCreateFacebookReader({
        facebookId,
        email,
      });

      return reader;
    } catch (error) {
      throw new ApiException(ErrorCode.FACEBOOK_ERROR, 403);
    }
  }

  async loginByEmail(email: string, password: string) {
    const reader = await this.ReaderModel.findOne({
      email: email.toLocaleLowerCase(),
      authType: AuthType.EMAIL,
    });

    if (!reader) {
      throw new ApiException(ErrorCode.READER_DOES_NOT_EXIST, 403);
    }

    const { password: passwordHash, hasAccess } = reader;

    if (!bcrypt.compareSync(password, passwordHash)) {
      throw new ApiException(ErrorCode.INCORRECT_PASSWORD, 403);
    }

    if (!hasAccess) {
      throw new ApiException(ErrorCode.HAS_NOT_ACCESS, 403);
    }

    return reader;
  }

  async refreshToken(readerId) {
    const reader = await this.ReaderModel.findById(readerId);

    if (!reader) {
      throw new ApiException(ErrorCode.READER_DOES_NOT_EXIST, 403);
    }

    const token = this.getToken(reader);

    const { toReadArticles, followedRegions, hasAccess } = reader;

    return {
      token,
      toReadArticles,
      followedRegions,
      hasAccess,
    };
  }

  async registerByEmail(
    email: string,
    password: string,
    repeatPassword: string,
  ): Promise<ReaderDocument> {
    const validationErrors = [];

    const possiblePasswordErrors = validatePassword(password, repeatPassword);
    const possibleEmailErrors = await this.validateEmail(email);

    validationErrors.push(...possiblePasswordErrors, ...possibleEmailErrors);

    if (validationErrors.length) {
      throw new ApiValidationException(422, validationErrors);
    }

    const passwordHash = await bcrypt.hash(
      password,
      +process.env.PASSWORD_SALT_ROUNDS,
    );

    const emailVerificationCode = randomBytes(15).toString('hex');

    const newReader = new this.ReaderModel({
      email: email.toLocaleLowerCase(),
      hasAccess: false,
      emailVerificationCode,
      password: passwordHash,
      authType: AuthType.EMAIL,
      createdAt: new Date(),
    });

    await newReader.save();

    await this.emailNotificationsService.sendEmailVerificationCode(
      email,
      emailVerificationCode,
    );

    return newReader;
  }

  async verifyEmail(emailVerificationCode): Promise<ReaderDocument> {
    const reader = await this.ReaderModel.findOneAndUpdate(
      { emailVerificationCode, hasAccess: false },
      { hasAccess: true, emailVerificationCode: null },
      { new: true },
    );

    if (!reader) {
      throw new ApiException(ErrorCode.EMAIL_VERIFICATION_FAILED, 403);
    }

    return reader;
  }

  async getArticlesFromFollowedRegions(
    readerId,
    page,
    perPage = config.defaultPerPage,
    withCount = false,
  ) {
    const reader = await this.ReaderModel.findById(readerId);

    const { followedRegions } = reader;

    const {
      articles,
      countAll,
    } = await this.articlesService.getArticlesFromRegionIds(
      followedRegions,
      page,
      perPage,
      withCount,
    );

    return {
      articles,
      countAll,
    };
  }

  async getArticlesToRead(
    readerId,
    page,
    perPage = config.defaultPerPage,
    withCount = false,
  ) {
    const reader = await this.ReaderModel.findById(readerId);

    const toReadArticles = reader.toReadArticles as Types.ObjectId[];

    const { articles, countAll } = await this.articlesService.getArticlesByIds({
      ids: toReadArticles,
      page,
      perPage,
      withCount,
    });

    return {
      articles,
      countAll,
    };
  }

  async addArticleToRead(readerId, articleToAddId) {
    const reader = await this.ReaderModel.findById(readerId);

    const { toReadArticles } = reader;

    if (objectIdsIncludes(toReadArticles as Types.ObjectId[], articleToAddId)) {
      throw new ApiException(
        ErrorCode.ARTICLE_HAS_BEEN_ALREADY_ADDED_TO_READ,
        409,
      );
    }

    await this.articlesService.checkifArticleExists(articleToAddId);

    Object.assign(reader, {
      toReadArticles: [...toReadArticles, new Types.ObjectId(articleToAddId)],
    });

    await reader.save();

    return reader;
  }

  async removeArticleToRead(readerId, articleToRemoveId) {
    const reader = await this.ReaderModel.findById(readerId);

    const { toReadArticles } = reader;

    if (
      !objectIdsIncludes(toReadArticles as Types.ObjectId[], articleToRemoveId)
    ) {
      throw new ApiException(ErrorCode.LACK_OF_ARTICLE_IN_TO_READ, 409);
    }

    Object.assign(reader, {
      toReadArticles: filterObjectIdsFrom(
        toReadArticles as Types.ObjectId[],
        articleToRemoveId,
      ),
    });

    await reader.save();

    return reader;
  }

  async getArticlesReaded(
    readerId,
    page,
    perPage = config.defaultPerPage,
    withCount = false,
  ) {
    const reader = await this.ReaderModel.findById(readerId);

    const readedArticles = reader.readedArticles as Types.ObjectId[];

    const { articles, countAll } = await this.articlesService.getArticlesByIds({
      ids: readedArticles,
      page,
      perPage,
      withCount,
    });

    return {
      articles,
      countAll,
    };
  }

  async addArticleReaded(readerId, articleToAddId) {
    const reader = await this.ReaderModel.findById(readerId);

    const { readedArticles } = reader;

    if (objectIdsIncludes(readedArticles as Types.ObjectId[], articleToAddId)) {
      throw new ApiException(
        ErrorCode.ARTICLE_HAS_BEEN_ALREADY_ADDED_READED,
        409,
      );
    }

    await this.articlesService.checkifArticleExists(articleToAddId);

    Object.assign(reader, {
      readedArticles: [...readedArticles, new Types.ObjectId(articleToAddId)],
    });

    await reader.save();

    return reader;
  }

  async removeArticleReaded(readerId, articleToRemoveId) {
    const reader = await this.ReaderModel.findById(readerId);

    const { readedArticles } = reader;

    if (
      !objectIdsIncludes(readedArticles as Types.ObjectId[], articleToRemoveId)
    ) {
      throw new ApiException(ErrorCode.LACK_OF_ARTICLE_IN_READED, 409);
    }

    Object.assign(reader, {
      readedArticles: filterObjectIdsFrom(
        readedArticles as Types.ObjectId[],
        articleToRemoveId,
      ),
    });

    await reader.save();

    return reader;
  }

  async getFollowedRegions(readerId) {
    const reader = await this.ReaderModel.findById(readerId).populate(
      'followedRegions',
    );

    const { followedRegions } = reader;

    return followedRegions;
  }

  async followRegion(readerId, regionToFollowId) {
    const reader = await this.ReaderModel.findById(readerId);

    const { followedRegions } = reader;

    if (
      objectIdsIncludes(followedRegions as Types.ObjectId[], regionToFollowId)
    ) {
      throw new ApiException(ErrorCode.REGION_ALEADY_FOLLOWED, 409);
    }

    await this.regionsService.checkIfRegionExists(regionToFollowId);

    Object.assign(reader, {
      followedRegions: [
        ...followedRegions,
        new Types.ObjectId(regionToFollowId),
      ],
    });

    await reader.save();

    return reader;
  }

  async unfollowRegion(readerId, regionToUnfollowId) {
    const reader = await this.ReaderModel.findById(readerId);

    const { followedRegions } = reader;

    if (
      !objectIdsIncludes(
        followedRegions as Types.ObjectId[],
        regionToUnfollowId,
      )
    ) {
      throw new ApiException(ErrorCode.LACK_OF_REGION_IN_FOLLOWED, 409);
    }

    Object.assign(reader, {
      followedRegions: filterObjectIdsFrom(
        followedRegions as Types.ObjectId[],
        regionToUnfollowId,
      ),
    });

    await reader.save();

    return reader;
  }

  async updateSettings(readerId, settings) {
    const reader = await this.ReaderModel.findById(readerId);

    if (!reader) {
      throw new ApiException(ErrorCode.READER_DOES_NOT_EXIST, 409);
    }

    Object.assign(reader, settings);

    await reader.save();

    return reader;
  }

  // async sendToKindle(readerId, articleId) {
  //   const reader = await this.ReaderModel.findById(readerId);

  //   if (!reader) {
  //     throw new ApiException(ErrorCode.READER_DOES_NOT_EXIST, 409);
  //   }

  //   const { kindleEmail } = reader;

  //   if (!kindleEmail) {
  //     throw new ApiException(ErrorCode.READER_HAS_NOT_KINDLE_EMAIL, 409);
  //   }

  //   await this.articlesService.sendArticleToEmail(articleId, kindleEmail);

  //   return true;
  // }

  // async sendToPocketBook(readerId, articleId) {
  //   const reader = await this.ReaderModel.findById(readerId);

  //   if (!reader) {
  //     throw new ApiException(ErrorCode.READER_DOES_NOT_EXIST, 409);
  //   }

  //   const { pocketBookEmail } = reader;

  //   if (!pocketBookEmail) {
  //     throw new ApiException(ErrorCode.READER_HAS_NOT_POCKET_BOOK_EMAIL, 409);
  //   }

  //   await this.articlesService.sendArticleToEmail(articleId, pocketBookEmail);

  //   return true;
  // }

  // Helper methods

  async validateEmail(email: string): Promise<ValidationError[]> {
    if (!emailRegexp.test(email)) {
      // throw new ApiException(ErrorCode.INCORRECT_EMAIL, 422);
      return [
        {
          field: 'email',
          message: ErrorCode.INCORRECT_EMAIL,
        },
      ];
    }

    const ifReaderExists = await this.ReaderModel.countDocuments({
      email,
      authType: AuthType.EMAIL,
    });

    if (ifReaderExists) {
      // throw new ApiException(ErrorCode.READER_WITH_EMAIL_ALREADY_EXISTS, 422);
      return [
        {
          field: 'email',
          message: ErrorCode.READER_WITH_EMAIL_ALREADY_EXISTS,
        },
      ];
    }

    return [];
  }

  getToken(reader: ReaderDocument) {
    const { _id: readerId, hasAccess, authType } = reader;

    const token = this.jwtService.sign(
      {
        readerId,
        hasAccess,
        authType,
      },
      {
        expiresIn: +process.env.JWT_EXPIRES_IN,
      },
    );

    return token;
  }
}
