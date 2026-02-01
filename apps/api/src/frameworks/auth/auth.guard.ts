import { auth } from '@cocostudio/database';
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class AuthGuard implements CanActivate {
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
      throw new UnauthorizedException('No request/response context');
    }

    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      throw new UnauthorizedException();
    }

    // Attach user and session to request for decorators
    request.user = session.user;
    request.session = session.session;

    return true;
  }
}
