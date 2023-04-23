import { Response } from 'express';
import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { ApiException } from './api.exception';

@Catch(ApiException)
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: ApiException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const errorCode = exception.getResponse();

    const errorMessage = { errorCode };

    const { details } = exception;
    if (details.length) {
      Object.assign(errorMessage, { details });
    }

    response.status(status).json(errorMessage);
  }
}
