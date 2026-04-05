import { join } from 'node:path';
import type { NestInterceptor } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { config } from 'dotenv';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { QueryAnalyzerInterceptor } from './frameworks/database/query-analyzer.interceptor';
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

  // Register global validation pipe (activates class-validator decorators)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Register GraphQL logging interceptor (resolve() needed for TRANSIENT-scoped providers)
  const loggerService = await app.resolve(LoggerService);
  const interceptors: NestInterceptor[] = [new GqlLoggingInterceptor(loggerService)];

  // Register slow-query / N+1 detection interceptor in development only
  if (process.env.NODE_ENV !== 'production') {
    const analyzerLogger = await app.resolve(LoggerService);
    interceptors.push(new QueryAnalyzerInterceptor(analyzerLogger));
  }

  app.useGlobalInterceptors(...interceptors);

  // Enable CORS — restrict Apollo Sandbox to development only
  const isProd = process.env.NODE_ENV === 'production';
  const corsOrigins: string[] = [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    process.env.BETTER_AUTH_URL || 'http://localhost:3001',
  ];
  if (!isProd) {
    corsOrigins.push(
      'http://localhost:3000',
      'http://localhost:3001',
      'https://studio.apollographql.com',
      'https://sandbox.embed.apollographql.com',
    );
  }

  app.enableCors({
    origin: [...new Set(corsOrigins)],
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'Accept'],
  });

  const port = process.env.API_PORT ?? 3001;
  await app.listen(port);

  const logger = app.get(Logger);
  logger.log(`Application is running on: http://localhost:${port}`, 'Bootstrap');
  logger.log(`GraphQL Sandbox: http://localhost:${port}/graphql`, 'Bootstrap');
}
bootstrap();
