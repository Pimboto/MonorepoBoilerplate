import { join } from 'node:path';
import { NestFactory } from '@nestjs/core';
import { config } from 'dotenv';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { GqlLoggingInterceptor, LoggerService } from './frameworks/logger';

// Load .env from the monorepo root (2 levels up from apps/api)
const envPath = join(process.cwd(), '../../.env');
config({ path: envPath });

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  // Use Pino logger
  app.useLogger(app.get(Logger));

  // Register GraphQL logging interceptor
  const loggerService = app.get(LoggerService);
  app.useGlobalInterceptors(new GqlLoggingInterceptor(loggerService));

  // Enable CORS for GraphQL and frontend
  app.enableCors({
    origin: [
      'http://localhost:3000', // Frontend (Next.js)
      'http://localhost:3001', // Backend (NestJS)
      process.env.BETTER_AUTH_URL || 'http://localhost:3001',
      'https://studio.apollographql.com',
      'https://sandbox.embed.apollographql.com',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'Accept'],
  });

  const port = process.env.API_PORT ?? 3001;
  await app.listen(port);

  const logger = app.get(Logger);
  logger.log(`Application is running on: http://localhost:${port}`, 'Bootstrap');
  logger.log(`GraphQL Sandbox: http://localhost:${port}/graphql`, 'Bootstrap');
}
bootstrap();
