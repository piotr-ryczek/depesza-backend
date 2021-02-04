import { HttpException } from '@nestjs/common';
import ErrorCode from 'src/lib/error-code';

export class ApiException extends HttpException {
  public details: string[];

  constructor(errorCode: ErrorCode, statusCode, details = []) {
    super(errorCode, statusCode);

    this.details = details;
  }
}
