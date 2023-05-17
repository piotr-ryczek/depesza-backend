import { IsString, IsOptional } from 'class-validator';

export class PublishersCreateArticleBodyDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  author?: string;

  @IsString()
  excerpt: string;

  @IsString()
  content: string;

  @IsString()
  regionId: string;

  @IsString()
  @IsOptional()
  isPublished?: boolean;
}
