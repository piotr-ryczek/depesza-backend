import { IsString } from 'class-validator';

export class PublishersUpdatePublisherBodyDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsString()
  authors: string;

  @IsString()
  patroniteUrl: string;

  @IsString()
  patreonUrl: string;

  @IsString()
  buyCoffeeToUrl: string;

  @IsString()
  facebookUrl: string;

  @IsString()
  twitterUrl: string;

  @IsString()
  www: string;
}
