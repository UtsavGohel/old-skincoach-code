import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  // rawBody:true preserves the unparsed request body on `req.rawBody` — required
  // for verifying the Clerk webhook's Svix HMAC signature (re-serialized JSON
  // would change the bytes). See AuthController.
  const app = await NestFactory.create(AppModule, { rawBody: true });

  // docs/05: all routes live under /api/v1
  app.setGlobalPrefix('api/v1');

  // docs/12/14: validate every request, never trust client input; strip/reject
  // unknown properties instead of silently passing them through.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  Logger.log(`SkinCoach API listening on port ${port}`, 'Bootstrap');
}

void bootstrap();
