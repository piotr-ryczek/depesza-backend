import { IsString } from 'class-validator';

export class ArticlesBasicQueryDto {
  @IsString()
  page: string;

  @IsString()
  perPage: string;
}
