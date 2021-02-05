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
import { ArticlesService } from 'src/modules/articles/articles.service';
import { ReadersService } from 'src/modules/readers/readers.service';
import { ApiExceptionFilter } from 'src/lib/exceptions/api-exception.filter';

@Controller('/readers')
@UseFilters(new ApiExceptionFilter())
export class ReadersController {
  constructor(
    @Inject(forwardRef(() => ArticlesService))
    private readonly articlesService: ArticlesService,
    @Inject(forwardRef(() => ReadersService))
    private readonly readersService: ReadersService,
  ) {}

  @Post('/loginByEmail')
  async loginByEmail(@Body() payload) {
    const { email, password } = payload;

    const token = await this.readersService.loginByEmail(email, password);

    return {
      token,
    };
  }

  @Post('/registerByEmail')
  async registerByEmail(@Body() payload) {
    const { email, password, repeatPassword } = payload;

    const newReader = await this.readersService.registerbyEmail(
      email,
      password,
      repeatPassword,
    );

    const token = this.readersService.getToken(newReader);

    return {
      token,
    };
  }

  @Post('/verifyEmail')
  async verifyEmail(@Body() payload) {
    const { emailVerificationCode } = payload;

    const reader = await this.readersService.verifyEmail(emailVerificationCode);
    const token = this.readersService.getToken(reader);

    return {
      token,
    };
  }

  // User board (articles from followed regions)
  @Get('/articles')
  @UseGuards(ReadersGuard)
  async getArticles(@Query() query, @Headers() headers) {
    const { page, perPage } = query;
    const { readerId } = headers;

    const articles = await this.readersService.getArticlesFromFollowedRegions(
      readerId,
      page,
      perPage,
    );

    return {
      articles,
    };
  }

  @Get('/articlesToRead')
  @UseGuards(ReadersGuard)
  async getArticlesToRead(@Query() query, @Headers() headers) {
    const { page, perPage } = query;
    const { readerId } = headers;

    const articles = await this.readersService.getArticlesToRead(
      readerId,
      page,
      perPage,
    );

    return {
      articles,
    };
  }

  @Post('/articlesToRead/:articleId')
  @UseGuards(ReadersGuard)
  async addArticleToRead(@Param('articleId') articleId, @Headers() headers) {
    const { readerId } = headers;

    await this.readersService.addArticleToRead(readerId, articleId);

    return {
      status: 'ok',
    };
  }

  @Delete('/articlesToRead/:articleId')
  @UseGuards(ReadersGuard)
  async removeArticleToRead(@Param('articleId') articleId, @Headers() headers) {
    const { readerId } = headers;

    await this.readersService.removeArticleToRead(readerId, articleId);

    return {
      status: 'ok',
    };
  }

  @Get('/articlesReaded')
  @UseGuards(ReadersGuard)
  async getArticlesReaded(@Query() query, @Headers() headers) {
    const { page, perPage } = query;
    const { readerId } = headers;

    const articles = await this.readersService.getArticlesReaded(
      readerId,
      page,
      perPage,
    );

    return {
      articles,
    };
  }

  @Post('/articlesReaded/:articleId')
  @UseGuards(ReadersGuard)
  async addArticleReaded(@Param('articleId') articleId, @Headers() headers) {
    const { readerId } = headers;

    await this.readersService.addArticleReaded(readerId, articleId);

    return {
      status: 'ok',
    };
  }

  @Delete('/articlesReaded/:articleId')
  @UseGuards(ReadersGuard)
  async removeArticleReaded(@Param('articleId') articleId, @Headers() headers) {
    const { readerId } = headers;

    await this.readersService.removeArticleReaded(readerId, articleId);

    return {
      status: 'ok',
    };
  }

  @Get('/regions')
  @UseGuards(ReadersGuard)
  async getFollowedRegions(@Headers() headers) {
    const { readerId } = headers;

    const regions = await this.readersService.getFollowedRegions(readerId);

    return {
      regions,
    };
  }

  @Post('/regions/:regionId')
  @UseGuards(ReadersGuard)
  async followRegion(@Param('regionId') regionId, @Headers() headers) {
    const { readerId } = headers;

    await this.readersService.followRegion(readerId, regionId);

    return {
      status: 'ok',
    };
  }

  @Delete('/regions/:regiondId')
  @UseGuards(ReadersGuard)
  async unfollowRegion(@Param('regionId') regionId, @Headers() headers) {
    const { readerId } = headers;

    await this.readersService.unfollowRegion(readerId, regionId);

    return {
      status: 'ok',
    };
  }
}
