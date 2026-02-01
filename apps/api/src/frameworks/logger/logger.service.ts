import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class LoggerService {
  constructor(private readonly logger: PinoLogger) {}

  log(message: string, context?: Record<string, unknown>): void {
    this.logger.info(context || {}, message);
  }

  error(message: string, trace?: string, context?: Record<string, unknown>): void {
    this.logger.error({ ...context, trace }, message);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.logger.warn(context || {}, message);
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.logger.debug(context || {}, message);
  }

  setContext(context: string): void {
    this.logger.setContext(context);
  }
}
