import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();

/**
 * Do kontynuacji:
 * regions.controller
 * articles.controller
 * publishers.controller
 * publishers-api.controller
 * wysyłanie do kindle
 */
