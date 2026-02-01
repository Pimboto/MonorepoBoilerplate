import { join } from 'node:path';
import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';
import { config } from 'dotenv';
import { AppModule } from './app.module';

// Load .env from the monorepo root (2 levels up from apps/api)
const envPath = join(process.cwd(), '../../.env');
config({ path: envPath });

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  // Use Pino logger
  app.useLogger(app.get(Logger));

  // Enable CORS for GraphQL and frontend
  app.enableCors({
    origin: [
      process.env.BETTER_AUTH_URL || 'http://localhost:3000',
      'http://localhost:3001',
      'https://studio.apollographql.com',
      'https://sandbox.embed.apollographql.com',
    ],
    credentials: true,
  });

  const port = process.env.API_PORT ?? 3001;
  await app.listen(port);

  const logger = app.get(Logger);
  logger.log(`Application is running on: http://localhost:${port}`, 'Bootstrap');
  logger.log(`GraphQL Sandbox: http://localhost:${port}/graphql`, 'Bootstrap');
}
bootstrap();
