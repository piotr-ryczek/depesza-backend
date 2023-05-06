import { IsString, IsBoolean } from 'class-validator';

export class PublishersUpdateArticleBodyDto {
  @IsString()
  title: string;

  @IsString()
  author: string;

  @IsString()
  excerpt: string;

  @IsString()
  content: string;

  @IsString()
  regionId: string;

  @IsBoolean()
  isPublished: boolean;
}
