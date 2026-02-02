import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  type NestInterceptor,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import type { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoggerService } from './logger.service';

@Injectable()
export class GqlLoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: LoggerService) {
    this.logger.setContext('GraphQL');
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const gqlCtx = GqlExecutionContext.create(context);
    const info = gqlCtx.getInfo();
    const resolverName = info.parentType?.name;
    const fieldName = info.fieldName;
    const operation = info.operation?.operation; // query/mutation/subscription

    this.logger.log('GraphQL request', {
      operation,
      resolver: resolverName,
      field: fieldName,
    });

    const now = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          this.logger.log('GraphQL response', {
            operation,
            resolver: resolverName,
            field: fieldName,
            durationMs: Date.now() - now,
          });
        },
        error: (error) => {
          this.logger.error(
            'GraphQL error',
            error.stack,
            {
              operation,
              resolver: resolverName,
              field: fieldName,
              durationMs: Date.now() - now,
              error: error.message,
            },
          );
        },
      }),
    );
  }
}
