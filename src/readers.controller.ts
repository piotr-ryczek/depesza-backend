import {
  Controller,
  Get,
  Post,
  Delete,
  Inject,
  forwardRef,
  Body,
  Query,
  Param,
  UseGuards,
  UseFilters,
  Headers,
} from '@nestjs/common';

import { ReadersGuard } from 'src/guards';
import { ReadersService } from 'src/modules/readers/readers.service';
import { ApiExceptionFilter } from 'src/lib/exceptions/api-exception.filter';
import { ApiValidationExceptionFilter } from 'src/lib/exceptions/api-validation-exception.filter';
import { ArticlesBasicQueryDto } from 'src/types/dtos/shared';
import {
  ReadersAuthByFacebookBodyDto,
  ReadersLoginByEmailBodyDto,
  ReadersRegisterByEmailBodyDto,
  ReadersVerifyByEmailBodyDto,
} from 'src/types/dtos/readers';

@Controller('/readers')
@UseFilters(new ApiExceptionFilter())
export class ReadersController {
  constructor(
    @Inject(forwardRef(() => ReadersService))
    private readonly readersService: ReadersService,
  ) {}

  @Post('/authByFacebook')
  async authByFacebook(@Body() payload: ReadersAuthByFacebookBodyDto) {
    const { authToken } = payload;

    const reader = await this.readersService.loginOrRegisterByFacebook(
      authToken,
    );
    const token = this.readersService.getToken(reader);

    const { toReadArticles, followedRegions, hasAccess } = reader;

    return {
      token,
      toReadArticles,
      followedRegions,
      hasAccess,
    };
  }

  @Post('/loginByEmail')
  async loginByEmail(@Body() payload: ReadersLoginByEmailBodyDto) {
    const { email, password } = payload;

    const reader = await this.readersService.loginByEmail(email, password);
    const token = this.readersService.getToken(reader);

    const { toReadArticles, followedRegions, hasAccess } = reader;

    return {
      token,
      toReadArticles,
      followedRegions,
      hasAccess,
    };
  }

  @Post('/refresh')
  @UseGuards(ReadersGuard)
  async refreshToken(@Headers('reader-id') readerId: string) {
    const {
      token,
      toReadArticles,
      followedRegions,
      hasAccess,
    } = await this.readersService.refreshToken(readerId);

    return {
      token,
      toReadArticles,
      followedRegions,
      hasAccess,
    };
  }

  @Post('/registerByEmail')
  @UseFilters(new ApiValidationExceptionFilter())
  async registerByEmail(@Body() payload: ReadersRegisterByEmailBodyDto) {
    const { email, password, repeatPassword } = payload;

    await this.readersService.registerByEmail(email, password, repeatPassword);

    return {
      status: 'ok',
    };
  }

  @Post('/verifyEmail')
  async verifyEmail(@Body() payload: ReadersVerifyByEmailBodyDto) {
    const { emailVerificationCode } = payload;

    const reader = await this.readersService.verifyEmail(emailVerificationCode);
    const token = this.readersService.getToken(reader);

    const { toReadArticles, followedRegions, hasAccess } = reader;

    return {
      token,
      toReadArticles,
      followedRegions,
      hasAccess,
    };
  }

  // User board (articles from followed regions)
  @Get('/articles')
  @UseGuards(ReadersGuard)
  async getArticles(
    @Query() query: ArticlesBasicQueryDto,
    @Headers('reader-id') readerId: string,
  ) {
    const { page, perPage } = query;

    const {
      articles,
    } = await this.readersService.getArticlesFromFollowedRegions(
      readerId,
      +page,
      +perPage,
    );

    return {
      articles,
    };
  }

  @Get('/articlesToRead')
  @UseGuards(ReadersGuard)
  async getArticlesToRead(
    @Query() query: ArticlesBasicQueryDto,
    @Headers('reader-id') readerId: string,
  ) {
    const { page, perPage } = query;

    const { articles } = await this.readersService.getArticlesToRead(
      readerId,
      +page,
      +perPage,
    );

    return {
      articles,
    };
  }

  @Post('/articlesToRead/:articleId')
  @UseGuards(ReadersGuard)
  async addArticleToRead(
    @Param('articleId') articleId: string,
    @Headers('reader-id') readerId: string,
  ) {
    await this.readersService.addArticleToRead(readerId, articleId);

    return {
      status: 'ok',
    };
  }

  @Delete('/articlesToRead/:articleId')
  @UseGuards(ReadersGuard)
  async removeArticleToRead(
    @Param('articleId') articleId: string,
    @Headers('reader-id') readerId: string,
  ) {
    await this.readersService.removeArticleToRead(readerId, articleId);

    return {
      status: 'ok',
    };
  }

  @Get('/articlesReaded')
  @UseGuards(ReadersGuard)
  async getArticlesReaded(
    @Query() query: ArticlesBasicQueryDto,
    @Headers('reader-id') readerId: string,
  ) {
    const { page, perPage } = query;

    const { articles } = await this.readersService.getArticlesReaded(
      readerId,
      +page,
      +perPage,
    );

    return {
      articles,
    };
  }

  @Post('/articlesReaded/:articleId')
  @UseGuards(ReadersGuard)
  async addArticleReaded(
    @Param('articleId') articleId: string,
    @Headers('reader-id') readerId: string,
  ) {
    await this.readersService.addArticleReaded(readerId, articleId);

    return {
      status: 'ok',
    };
  }

  @Delete('/articlesReaded/:articleId')
  @UseGuards(ReadersGuard)
  async removeArticleReaded(
    @Param('articleId') articleId: string,
    @Headers('reader-id') readerId: string,
  ) {
    await this.readersService.removeArticleReaded(readerId, articleId);

    return {
      status: 'ok',
    };
  }

  @Get('/regions')
  @UseGuards(ReadersGuard)
  async getFollowedRegions(@Headers('reader-id') readerId: string) {
    const regions = await this.readersService.getFollowedRegions(readerId);

    return {
      regions,
    };
  }

  @Post('/regions/:regionId')
  @UseGuards(ReadersGuard)
  async followRegion(
    @Param('regionId') regionId: string,
    @Headers('reader-id') readerId: string,
  ) {
    await this.readersService.followRegion(readerId, regionId);

    return {
      status: 'ok',
    };
  }

  @Delete('/regions/:regionId')
  @UseGuards(ReadersGuard)
  async unfollowRegion(
    @Param('regionId') regionId: string,
    @Headers('reader-id') readerId: string,
  ) {
    await this.readersService.unfollowRegion(readerId, regionId);

    return {
      status: 'ok',
    };
  }

  // @Patch('/settings')
  // @UseGuards(ReadersGuard)
  // async updateSettings(
  //   @Body() payload,
  //   @Headers('reader-id') readerId: string,
  // ) {
  //   await this.readersService.updateSettings(readerId, payload);

  //   return {
  //     status: 'ok',
  //   };
  // }

  // @Post('/sendToKindle/:articleId')
  // @UseGuards(ReadersGuard)
  // async sendToKindle(@Param('articleId') articleId, @Headers('reader-id') readerId) {

  //   await this.readersService.sendToKindle(readerId, articleId);

  //   return {
  //     status: 'ok',
  //   };
  // }

  // @Post('/sendToPocketBook/:articleId')
  // @UseGuards(ReadersGuard)
  // async sendToPocketBook(@Param('articleId') articleId, @Headers('reader-id') readerId) {

  //   await this.readersService.sendToPocketBook(readerId, articleId);

  //   return {
  //     status: 'ok',
  //   };
  // }
}
