import * as helmet from 'helmet';
import * as morgan from 'morgan';

import { NestFactory } from '@nestjs/core';
import {
  BadRequestException,
  Logger,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(helmet());
  app.use(morgan('tiny'));
  app.enableCors(); // TODO: Restrict
  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (validationErrors: ValidationError[] = []) => {
        Logger.error(validationErrors);
        return new BadRequestException(
          validationErrors.map(({ constraints }) => constraints),
        );
      },
    }),
  );
  await app.listen(5000);
}
bootstrap();
