import { HttpException } from '@nestjs/common';
import ErrorCode from 'src/lib/error-code';

export class ApiValidationException extends HttpException {
  public fields;

  constructor(statusCode, fields = []) {
    super(ErrorCode.VALIDATION_ERRORS, statusCode);

    this.fields = fields;
  }
}
