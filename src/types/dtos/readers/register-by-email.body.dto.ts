import { IsString } from 'class-validator';

export class ReadersRegisterByEmailBodyDto {
  @IsString()
  email: string;

  @IsString()
  password: string;

  @IsString()
  repeatPassword: string;
}
