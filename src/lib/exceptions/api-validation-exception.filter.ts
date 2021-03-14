import { Response } from 'express';
import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { ApiValidationException } from './api-validation.exception';

@Catch(ApiValidationException)
export class ApiValidationExceptionFilter implements ExceptionFilter {
  catch(exception: ApiValidationException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const errorCode = exception.getResponse();

    const { fields } = exception;
    const errorMessage = { errorCode, fields };

    response.status(status).json(errorMessage);
  }
}
