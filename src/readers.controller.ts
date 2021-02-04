import {
  Controller,
  Get,
  Post,
  Delete,
  Inject,
  forwardRef,
  Body,
  UseGuards,
  UseFilters,
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
    const { verificationCode } = payload;

    const token = await this.readersService.verifyEmail(verificationCode);

    return {
      token,
    };
  }

  // User board (articles from followed regions)
  @Get('/articles')
  @UseGuards(ReadersGuard)
  getArticles() {
    console.log('Dotarliśmy');
  }

  @Get('/articlesToRead')
  @UseGuards(ReadersGuard)
  getArticlesToRead() {}

  @Post('/articlesToRead/:articleId')
  @UseGuards(ReadersGuard)
  addArticleToRead() {}

  @Delete('/articlesToRead/:articleId')
  @UseGuards(ReadersGuard)
  removeArticleToRead() {}

  @Get('/articlesReaded')
  @UseGuards(ReadersGuard)
  getArticlesReaded() {}

  @Post('/articlesReaded/:articleId')
  @UseGuards(ReadersGuard)
  addArticleReaded() {}

  @Delete('/articlesReaded/:articleId')
  @UseGuards(ReadersGuard)
  removeArticleReaded() {}

  @Get('/regions')
  @UseGuards(ReadersGuard)
  getFollowedRegions() {}

  @Post('/regions/:regionId')
  @UseGuards(ReadersGuard)
  followRegion() {}

  @Delete('/regions/:regiondId')
  @UseGuards(ReadersGuard)
  unfollowRegion() {}
}

/*
POST /readers/loginByEmail
POST /readers/registerByEmail

POST /readers/verifyEmail (Reader)
GET /readers/articles (Reader - tablica użytkownika)
GET /readers/articlesToRead (Reader)
POST /readers/articlesToRead/:articleId (Reader)
DELETE /readers/articlesToRead/:articleId (Reader)

GET /readers/articlesReaded (Reader)
POST /readers/articlesReaded/:articleId (Reader)
DELETE /readers/articlesReaded/:articleId (Reader)

GET /readers/regions (Reader - obserwowane regiony)
POST /readers/regions/:regionId (Reader)
DELETE /readers/regions/:regionId (Reader)
*/
