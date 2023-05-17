import { IsString } from 'class-validator';

export class ReadersLoginByEmailBodyDto {
  @IsString()
  email: string;

  @IsString()
  password: string;
}
