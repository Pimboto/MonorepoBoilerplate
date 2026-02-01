import { join } from 'node:path';
import { auth } from '@cocostudio/database'; // Import auth instance
import { NestFactory } from '@nestjs/core';
import { toNodeHandler } from 'better-auth/node';
import * as bodyParser from 'body-parser';
import { config } from 'dotenv';
import type { NextFunction, Request, Response } from 'express';
import { AppModule } from './app.module';

// Load .env from the monorepo root (2 levels up from apps/api)
const envPath = join(process.cwd(), '../../.env');
config({ path: envPath });

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false, // Disable default body parser
  });

  // Mount Better Auth handler manually
  app.use('/api/auth', toNodeHandler(auth));

  // Manually apply body parser to all routes EXCEPT Better Auth routes (which handles its own body)
  app.use(async (req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith('/api/auth')) {
      next();
    } else {
      bodyParser.json()(req, res, next);
    }
  });

  // Also apply urlencoded
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith('/api/auth')) {
      next();
    } else {
      bodyParser.urlencoded({ extended: true })(req, res, next);
    }
  });

  // Enable CORS
  app.enableCors({
    origin: [
      process.env.BETTER_AUTH_URL || 'http://localhost:3000',
      'http://localhost:3001',
      'https://studio.apollographql.com',
      'https://sandbox.embed.apollographql.com',
    ],
    credentials: true,
  });

  await app.listen(process.env.API_PORT ?? 3001);
}
bootstrap();
