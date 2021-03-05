import * as helmet from 'helmet';
import * as morgan from 'morgan';

import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(helmet());
  app.use(morgan('tiny'));
  app.enableCors(); // TODO: Restrict
  await app.listen(5000);
}
bootstrap();

/**
 * TODO list:
 * OAuth Facebook Login/Register
 * Send to Kindle/Pocketbook (postponed)
 */
