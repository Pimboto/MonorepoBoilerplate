import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  type NestInterceptor,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import type { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import type { LoggerService } from '../logger';

const SLOW_THRESHOLD_MS = 500;

/**
 * QueryAnalyzerInterceptor — Development-only interceptor that detects
 * slow GraphQL resolvers (>500ms). Slow responses are the primary
 * symptom of N+1 query problems, making this an effective runtime signal
 * without needing to hook into Prisma's query layer per-request.
 *
 * Register this interceptor in main.ts ONLY when NODE_ENV === 'development'.
 */
@Injectable()
export class QueryAnalyzerInterceptor implements NestInterceptor {
  constructor(private readonly logger: LoggerService) {
    this.logger.setContext('QueryAnalyzer');
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const gqlCtx = GqlExecutionContext.create(context);
    const info = gqlCtx.getInfo();
    const resolverName = info?.parentType?.name ?? 'Unknown';
    const fieldName = info?.fieldName ?? 'unknown';
    const operation = info?.operation?.operation ?? 'unknown';
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const durationMs = Date.now() - startTime;
          if (durationMs > SLOW_THRESHOLD_MS) {
            this.logger.warn(
              `Slow resolver detected: ${resolverName}.${fieldName} took ${durationMs}ms (threshold: ${SLOW_THRESHOLD_MS}ms). Possible N+1 query.`,
              {
                operation,
                resolver: resolverName,
                field: fieldName,
                durationMs,
                threshold: SLOW_THRESHOLD_MS,
              },
            );
          }
        },
        error: () => {
          const durationMs = Date.now() - startTime;
          if (durationMs > SLOW_THRESHOLD_MS) {
            this.logger.warn(
              `Slow resolver (with error): ${resolverName}.${fieldName} took ${durationMs}ms`,
              {
                operation,
                resolver: resolverName,
                field: fieldName,
                durationMs,
                threshold: SLOW_THRESHOLD_MS,
              },
            );
          }
        },
      }),
    );
  }
}
