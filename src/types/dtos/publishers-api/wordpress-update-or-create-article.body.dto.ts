import { IsString, IsOptional } from 'class-validator';

export class WordpressUpdateOrCreateArticleDto {
  @IsString()
  wordpressId: string;

  @IsString()
  title: string;

  @IsString()
  excerpt: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  photoUrl?: string;

  @IsString()
  regionId: string;
}
