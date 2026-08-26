import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const port = process.env.PORT || 3030;
  const isProduction = process.env.NODE_ENV === 'production';

  app.enableCors({
    origin: isProduction
      ? (process.env.CORS_ORIGINS ?? '')
          .split(',')
          .map((origin) => origin.trim())
          .filter(Boolean)
      : true,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  await app.listen(port);
  console.log(`http://localhost:${port}`);
}
bootstrap();
