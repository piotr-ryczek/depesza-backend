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
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

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
  async login(
    @Body() payload: { email: string; password: string; code: string },
  ) {
    const { email, password, code } = payload;

    const {
      token,
      hasPassword,
      articlesReported,
      publisherId,
    } = await this.publishersService.login(email, password, code);

    return {
      token,
      hasPassword,
      articlesReported,
      publisherId,
    };
  }

  @Post('/refresh')
  @UseGuards(PublishersGuard)
  async refreshToken(@Headers('publisher-id') publisherId: string) {
    const {
      token,
      hasPassword,
      articlesReported,
    } = await this.publishersService.refreshToken(publisherId);

    return {
      token,
      hasPassword,
      articlesReported,
      publisherId,
    };
  }

  @Post('/setPassword')
  @UseGuards(PublishersInitialGuard)
  async setPassword(
    @Body() payload: { password: string; repeatPassword: string },
    @Headers('publisher-id') publisherId: string,
  ) {
    const { password, repeatPassword } = payload;

    const { secret2FA, email } = await this.publishersService.setPassword({
      publisherId,
      password,
      repeatPassword,
    });

    return {
      secret2FA,
      email,
    };
  }

  @Get('/')
  async getPublishers() {
    const publishers = await this.publishersService.getPublishers();

    return {
      publishers,
    };
  }

  @Get('/articles')
  @UseGuards(PublishersGuard)
  async getOwnArticles(@Query() query, @Headers('publisher-id') publisherId) {
    const { page, perPage } = query;

    const {
      articles,
      countAll,
    } = await this.articlesService.getPublisherArticles({
      publisherId,
      page,
      perPage,
      withCount: true,
      onlyAccessible: false,
    });

    return {
      articles,
      countAll,
    };
  }

  @Post('/articles')
  @UseGuards(PublishersGuard)
  @UseInterceptors(FileInterceptor('file'))
  async createArticle(
    @Body() payload,
    @Headers('publisher-id') publisherId,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const { title, excerpt, content, regionId, isPublished } = payload;

    const article = await this.articlesService.createArticle({
      publisherId,
      isPublished,
      title,
      excerpt,
      content,
      regionId,
      photoFile: file,
    });

    return {
      article,
    };
  }

  @Delete('/articles/:articleId')
  @UseGuards(PublishersGuard)
  async deleteArticle(
    @Param('articleId') articleId,
    @Headers('publisher-id') publisherId,
  ) {
    await this.articlesService.deleteArticle(publisherId, articleId);

    return {
      status: 'ok',
    };
  }

  @Put('/own')
  @UseGuards(PublishersGuard)
  @UseInterceptors(FileInterceptor('file'))
  async updatePublisher(
    @Body() payload,
    @Headers('publisher-id') publisherId,
    @UploadedFile() file,
  ) {
    const {
      name,
      description,
      authors,
      patroniteUrl,
      facebookUrl,
      twitterUrl,
      www,
    } = payload;

    const publisher = await this.publishersService.updatePublisher(
      publisherId,
      {
        name,
        description,
        authors: authors.split(','),
        logoFile: file,
        patroniteUrl,
        facebookUrl,
        twitterUrl,
        www,
      },
    );

    return {
      publisher,
    };
  }

  @Put('/articles/:articleId')
  @UseGuards(PublishersGuard)
  @UseInterceptors(FileInterceptor('file'))
  async updateArticle(
    @Body() payload,
    @Param('articleId') articleId,
    @Headers('publisher-id') publisherId: string,
    @UploadedFile() file,
  ) {
    const { title, author, excerpt, content, regionId, isPublished } = payload;

    const article = await this.articlesService.updateArticle(
      articleId,
      publisherId,
      {
        isPublished,
        title,
        author,
        excerpt,
        content,
        photoFile: file,
        regionId,
      },
    );

    return {
      article,
    };
  }

  @Get('/articlesReported')
  @UseGuards(PublishersGuard)
  async getReportedArticles(
    @Query() query,
    @Headers('publisher-id') publisherId,
  ) {
    const { page, perPage } = query;

    const { articles } = await this.publishersService.getReportedArticles(
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
  async reportArticle(
    @Param('articleId') articleId,
    @Headers('publisher-id') publisherId,
  ) {
    await this.publishersService.reportArticle(publisherId, articleId);

    return {
      status: 'ok',
    };
  }

  @Delete('/articlesReported/:articleId')
  @UseGuards(PublishersGuard)
  async undoReportArticle(
    @Param('articleId') articleId,
    @Headers('publisher-id') publisherId,
  ) {
    await this.publishersService.undoReportArticle(publisherId, articleId);

    return {
      status: 'ok',
    };
  }

  @Get('/own')
  @UseGuards(PublishersGuard)
  async getOwnPublisher(@Headers('publisher-id') publisherId) {
    const publisher = await this.publishersService.getPublisher(publisherId);

    return {
      publisher,
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

    const { articles } = await this.articlesService.getPublisherArticles({
      publisherId,
      page,
      perPage,
    });

    return {
      articles,
    };
  }
}
