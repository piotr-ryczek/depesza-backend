import { IsEmail, IsString } from 'class-validator';

export class ReadersRegisterByEmailBodyDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsString()
  repeatPassword: string;
}
