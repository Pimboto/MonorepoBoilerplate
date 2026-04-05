import { ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ThrottlerGuard } from '@nestjs/throttler';

/**
 * GraphQL-specific throttler guard.
 *
 * The default ThrottlerGuard reads req/res from the HTTP context, which does
 * not exist inside a GraphQL resolver. This override extracts them from the
 * GqlExecutionContext instead, so rate-limiting works transparently for both
 * REST and GraphQL requests.
 */
@Injectable()
export class GqlThrottlerGuard extends ThrottlerGuard {
  override getRequestResponse(context: ExecutionContext) {
    const type = context.getType<string>();

    if (type === 'graphql') {
      const gqlCtx = GqlExecutionContext.create(context);
      const ctx = gqlCtx.getContext<{
        req: Record<string, unknown>;
        res: Record<string, unknown>;
      }>();
      return { req: ctx.req, res: ctx.res };
    }

    return super.getRequestResponse(context);
  }
}
