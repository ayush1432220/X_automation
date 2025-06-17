// File: x_scheduler_app/src/main.ts

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as session from 'express-session';
import * as passport from 'passport';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const frontendUrl = 'http://localhost:3001'; // Aapke frontend ka URL

  // --- CORS ko Enable Karein ---
  app.enableCors({
    origin: frontendUrl,
    credentials: true,
  });
  // -----------------------------

  app.useGlobalPipes(new ValidationPipe());

  app.use(
    session({
      secret: configService.get<string>('SESSION_SECRET') || 'default_secret',
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 3600000,
      },
    }),
  );

  app.use(passport.initialize());
  app.use(passport.session());

  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port);
  console.log(`🚀 Backend server running at http://localhost:${port}`);
  console.log(`🚀 Accepting requests from frontend at ${frontendUrl}`);
}
bootstrap();