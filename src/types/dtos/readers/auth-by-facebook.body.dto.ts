import { IsString } from 'class-validator';

export class ReadersAuthByFacebookBodyDto {
  @IsString()
  authToken: string;
}
