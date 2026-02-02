// logger.service.ts
import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

interface LogContext {
  context?: string; // e.g. 'AuthResolver'
  [key: string]: unknown;
}

@Injectable()
export class LoggerService {
  constructor(private readonly logger: PinoLogger) {}

  // General
  info(message: string, context?: LogContext): void {
    this.logger.info(context ?? {}, message);
  }

  log(message: string, context?: LogContext): void {
    this.info(message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.logger.warn(context ?? {}, message);
  }

  error(message: string, error?: unknown, context?: LogContext): void {
    const errorPayload =
      error instanceof Error
        ? { name: error.name, message: error.message, stack: error.stack }
        : { error };

    this.logger.error({ ...context, ...errorPayload }, message);
  }

  debug(message: string, context?: LogContext): void {
    this.logger.debug(context ?? {}, message);
  }

  // Para anclar contexto de clase (Nest style)
  setContext(context: string): void {
    this.logger.setContext(context);
  }

  // Ejemplo de helper de dominio
  logUserAction(action: string, payload: Record<string, unknown> = {}): void {
    this.logger.info(
      {
        type: 'user_action',
        action,
        ...payload,
      },
      `User action: ${action}`,
    );
  }
}
