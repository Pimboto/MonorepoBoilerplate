import { auth } from '@cocostudio/database';
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { LoggerService } from '../logger';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly logger: LoggerService) {
    this.logger.setContext('AuthGuard');
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isGraphQL = context.getType<string>() === 'graphql';

    let request = context.switchToHttp().getRequest();
    let response = context.switchToHttp().getResponse();

    if (isGraphQL) {
      const ctx = GqlExecutionContext.create(context);
      request = ctx.getContext().req;
      response = ctx.getContext().res;
    }

    if (!request || !response) {
      this.logger.warn('No request/response context available');
      throw new UnauthorizedException('No request/response context');
    }

    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      this.logger.warn('Unauthorized access attempt', {
        path: request.path || request.url,
        ip: request.ip,
        method: request.method,
      });
      throw new UnauthorizedException();
    }

    // Attach user and session to request for decorators
    request.user = session.user;
    request.session = session.session;

    this.logger.debug('Authenticated request', {
      userId: session.user.id,
      email: session.user.email,
      path: request.path || request.url,
    });

    return true;
  }
}
