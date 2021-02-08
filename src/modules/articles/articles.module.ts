import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Article, ArticleSchema } from 'src/schemas/article.schema';
import { FilesModule } from 'src/modules/files/files.module';
import { EmailNotificationsModule } from 'src/modules/email-notifications/email-notifications.module';

import { ArticlesService } from './articles.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Article.name, schema: ArticleSchema }]),
    FilesModule,
    EmailNotificationsModule,
  ],
  providers: [ArticlesService],
  exports: [ArticlesService],
})
export class ArticlesModule {}
