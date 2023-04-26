import { IsEmail, IsString } from 'class-validator';

export class PublishersLoginBodyDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsString()
  code: string;
}
