import { IsString, IsBoolean } from 'class-validator';

export class PublishersCreateArticleBodyDto {
  @IsString()
  title: string;

  @IsString()
  excerpt: string;

  @IsString()
  content: string;

  @IsString()
  regionId: string;

  @IsBoolean()
  isPublished: boolean;
}
