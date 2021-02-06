import {
  Controller,
  Get,
  Post,
  Delete,
  Put,
  UseGuards,
  UseFilters,
  Inject,
  forwardRef,
  Headers,
  Param,
  Query,
  Body,
  Head,
} from '@nestjs/common';

import { PublishersGuard, PublishersInitialGuard } from 'src/guards';
import { ApiExceptionFilter } from 'src/lib/exceptions/api-exception.filter';
import { PublishersService } from 'src/modules/publishers/publishers.service';
import { ArticlesService } from 'src/modules/articles/articles.service';

@Controller('/publishers')
@UseFilters(new ApiExceptionFilter())
export class PublishersController {
  constructor(
    @Inject(forwardRef(() => ArticlesService))
    private readonly articlesService: ArticlesService,
    @Inject(forwardRef(() => PublishersService))
    private readonly publishersService: PublishersService,
  ) {}

  @Post('/login')
  async login(@Body() payload) {
    const { email, password, code } = payload;

    const token = await this.publishersService.login(email, password, code);

    return {
      token,
    };
  }

  @Post('/setPassword')
  @UseGuards(PublishersInitialGuard)
  async setPassword(@Body() payload, @Headers() headers) {
    const { publisherId } = headers;
    const { password, repeatPassword } = payload;

    const secret2FA = await this.publishersService.setPassword({
      publisherId,
      password,
      repeatPassword,
    });

    return {
      secret2FA,
    };
  }

  @Get('/')
  async getPublishers() {
    const publishers = await this.publishersService.getPublishers();

    return {
      publishers,
    };
  }

  @Get('/:publisherId')
  async getPublisher(@Param('publisherId') publisherId) {
    const publisher = await this.publishersService.getPublisher(publisherId);

    return {
      publisher,
    };
  }

  @Get('/:publisherId/articles')
  async getPublisherArticles(
    @Param('publisherId') publisherId,
    @Query() query,
  ) {
    const { page, perPage } = query;

    const articles = await this.articlesService.getPublisherArticles(
      publisherId,
      page,
      perPage,
    );

    return {
      articles,
    };
  }

  @Post('/articles')
  @UseGuards(PublishersGuard)
  async createArticle(@Body() payload, @Headers() headers) {
    const { publisherId } = headers;
    const { title, excerpt, content, photoUrl, regionId } = payload;

    const article = await this.articlesService.createArticle({
      publisherId,
      title,
      excerpt,
      content,
      photoUrl,
      regionId,
    });

    return {
      article,
    };
  }

  @Delete('/articles/:articleId')
  @UseGuards(PublishersGuard)
  async deleteArticle(@Param('articleId') articleId, @Headers() headers) {
    const { publisherId } = headers;

    await this.articlesService.deleteArticle(publisherId, articleId);

    return {
      status: 'ok',
    };
  }

  @Put('/articles/:articleId')
  @UseGuards(PublishersGuard)
  async updateArticle(
    @Body() payload,
    @Param('articleId') articleId,
    @Headers() headers,
  ) {
    const { publisherId } = headers;
    const { title, excerpt, content, photoUrl, regionId } = payload;

    const article = await this.articlesService.updateArticle(
      articleId,
      publisherId,
      {
        publisherId,
        title,
        excerpt,
        content,
        photoUrl,
        regionId,
      },
    );

    return {
      article,
    };
  }

  @Get('/articlesReported')
  @UseGuards(PublishersGuard)
  async getReportedArticles(@Query() query, @Headers() headers) {
    const { publisherId } = headers;
    const { page, perPage } = query;

    const articles = await this.publishersService.getReportedArticles(
      publisherId,
      page,
      perPage,
    );

    return {
      articles,
    };
  }

  @Post('/articlesReported/:articleId')
  @UseGuards(PublishersGuard)
  async reportArticle(@Param('articleId') articleId, @Headers() headers) {
    const { publisherId } = headers;

    await this.publishersService.reportArticle(publisherId, articleId);

    return {
      status: 'ok',
    };
  }

  @Delete('/articlesReported/:articleId')
  @UseGuards(PublishersGuard)
  async undoReportArticle(@Param('articleId') articleId, @Headers() headers) {
    const { publisherId } = headers;

    await this.publishersService.undoReportArticle(publisherId, articleId);

    return {
      status: 'ok',
    };
  }
}

/*
POST /publishers/login
POST /publishers/login

GET /publishers/:publisherId (All)
GET /publishers/:publisherId/articles (All)

POST /publishers/articles
DELETE /publishers/articles/:articleId
PUT /publishers/articles/:articleId

GET /publishers/articlesReported (Publisher)
POST /publishers/articlesReported/:articleId (Publisher)
DELETE /publishers/articlesReported/:articleId (Publisher)
*/

// eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJwdWJsaXNoZXJJZCI6IjYwMWRhZTI3ZmUxMzY5NTE5Mzc4MjdhMiIsImhhc1Bhc3N3b3JkIjp0cnVlLCJpYXQiOjE2MTI1NTkwNTV9.Nvjgpg3pdYpxsqehttGFICPwHx3ozihTmObAwSosklmjpyH03TzV7nZgq3fCITmOzg3ZICzUVevWm1cZypwiWA
