import { IsEmail, IsString } from 'class-validator';

export class ReadersLoginByEmailBodyDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
