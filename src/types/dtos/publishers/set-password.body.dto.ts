import { IsString } from 'class-validator';

export class PublishersSetPasswordBodyDto {
  @IsString()
  password: string;

  @IsString()
  repeatPassword: string;
}
