import { IsString } from 'class-validator';

export class PublishersLoginBodyDto {
  @IsString()
  email: string;

  @IsString()
  password: string;

  @IsString()
  code: string;
}
