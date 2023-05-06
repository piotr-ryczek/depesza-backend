import { IsString } from 'class-validator';

export class ReadersVerifyByEmailBodyDto {
  @IsString()
  emailVerificationCode: string;
}
