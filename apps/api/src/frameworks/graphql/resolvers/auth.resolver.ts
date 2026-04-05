import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import type { Request, Response } from 'express';
import { DomainError } from '../../../core/errors';
import type { SignInUseCase } from '../../../use-cases/auth/sign-in.use-case';
import type { SignOutUseCase } from '../../../use-cases/auth/sign-out.use-case';
import type { SignUpUseCase } from '../../../use-cases/auth/sign-up.use-case';
import { AuthGuard } from '../../auth/auth.guard';
import type { LoggerService } from '../../logger';
import { InternalServerError, toGraphQLError } from '../errors/auth.error';
import type { SignInInput, SignUpInput } from '../types/auth.input';
import { AuthPayload } from '../types/auth.payload';

@Resolver()
export class AuthResolver {
  constructor(
    private readonly logger: LoggerService,
    private readonly signUpUseCase: SignUpUseCase,
    private readonly signInUseCase: SignInUseCase,
    private readonly signOutUseCase: SignOutUseCase,
  ) {
    this.logger.setContext('AuthResolver');
  }

  private extractHeaders(req: Request): Record<string, string> {
    const baseUrl = process.env.BETTER_AUTH_URL || 'http://localhost:3001';
    return {
      origin: (req.headers.origin as string) || baseUrl,
      'user-agent': (req.headers['user-agent'] as string) || 'GraphQL-Client',
      ...(req.headers.cookie ? { cookie: req.headers.cookie } : {}),
    };
  }

  private setCookies(res: Response, setCookieHeaders: string[]): void {
    if (setCookieHeaders.length > 0) {
      res.setHeader('set-cookie', setCookieHeaders);
    }
  }

  @Mutation(() => AuthPayload, { description: 'Sign up a new user' })
  async signUp(
    @Args('input') input: SignUpInput,
    @Context() context: { req: Request; res: Response },
  ): Promise<AuthPayload> {
    this.logger.log('Sign up attempt', { email: input.email });

    try {
      const headers = this.extractHeaders(context.req);
      const result = await this.signUpUseCase.execute(
        { email: input.email, password: input.password, name: input.name },
        headers,
      );

      this.setCookies(context.res, result.setCookieHeaders);

      this.logger.log('Sign up successful', { email: input.email });

      return {
        user: result.user,
        session: result.session,
        message: result.session
          ? 'Sign up successful'
          : 'Sign up successful. Please verify your email.',
      } as AuthPayload;
    } catch (error: unknown) {
      if (error instanceof DomainError) throw toGraphQLError(error);
      this.logger.error('Sign up error', (error as Error).stack, {
        email: input.email,
      });
      throw new InternalServerError('An unexpected error occurred during sign up');
    }
  }

  @Mutation(() => AuthPayload, { description: 'Sign in an existing user' })
  async signIn(
    @Args('input') input: SignInInput,
    @Context() context: { req: Request; res: Response },
  ): Promise<AuthPayload> {
    this.logger.log('Sign in attempt', { email: input.email });

    try {
      const headers = this.extractHeaders(context.req);
      const result = await this.signInUseCase.execute(
        { email: input.email, password: input.password },
        headers,
      );

      this.setCookies(context.res, result.setCookieHeaders);

      this.logger.log('Sign in successful', { email: input.email });

      return {
        user: result.user,
        session: result.session,
        message: 'Sign in successful',
      } as AuthPayload;
    } catch (error: unknown) {
      if (error instanceof DomainError) throw toGraphQLError(error);
      this.logger.error('Sign in error', (error as Error).stack, {
        email: input.email,
      });
      throw new InternalServerError('Sign in failed. Please try again.');
    }
  }

  @Mutation(() => Boolean, { description: 'Sign out the current user' })
  @UseGuards(AuthGuard)
  async signOut(@Context() context: { req: Request; res: Response }): Promise<boolean> {
    const authenticatedReq = context.req as Request & { user?: { id?: string } };
    const userId = authenticatedReq.user?.id;
    this.logger.log('Sign out attempt', { userId });

    try {
      const headers = this.extractHeaders(context.req);
      const result = await this.signOutUseCase.execute(headers);

      this.setCookies(context.res, result.setCookieHeaders);

      this.logger.log('Sign out successful', { userId });
      return true;
    } catch (error: unknown) {
      if (error instanceof DomainError) throw toGraphQLError(error);
      this.logger.error('Sign out error', (error as Error).stack, { userId });
      throw new InternalServerError('Sign out failed. Please try again.');
    }
  }
}
