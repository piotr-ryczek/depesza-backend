import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();

/**
 * Do kontynuacji:
 * pobieranie swoich artykułów (publisher)
 * wysyłanie maili z kodem do użytkowników
 * publishers-api.controller
 * wysyłanie do kindle/pocketbook
 */
