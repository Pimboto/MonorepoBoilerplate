import { auth } from '@cocostudio/database';
import { signInSchema, signUpSchema } from '@cocostudio/shared';
import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import type { Request, Response } from 'express';
import { AuthGuard } from '../../auth/auth.guard';
import { LoggerService } from '../../logger';
import {
  AuthenticationError,
  BadRequestError,
  InternalServerError,
  ValidationError,
} from '../errors/auth.error';
import { SignInInput, SignUpInput } from '../types/auth.input';
import { AuthPayload } from '../types/auth.payload';

@Resolver()
export class AuthResolver {
  constructor(private readonly logger: LoggerService) {
    this.logger.setContext('AuthResolver');
  }

  @Mutation(() => AuthPayload, { description: 'Sign up a new user' })
  async signUp(
    @Args('input') input: SignUpInput,
    @Context() context: { req: Request; res: Response },
  ): Promise<AuthPayload> {
    this.logger.log('Sign up attempt', { email: input.email });

    try {
      // Validate input with Zod schema
      const validatedInput = signUpSchema.parse({
        email: input.email,
        password: input.password,
        name: input.name,
      });

      // Create a proper Request-like object for Better Auth
      const baseUrl = process.env.BETTER_AUTH_URL || 'http://localhost:3001';
      const mockRequest = new Request(`${baseUrl}/api/auth/sign-up/email`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          origin: context.req.headers.origin || baseUrl,
          'user-agent': context.req.headers['user-agent'] || 'GraphQL-Client',
          ...(context.req.headers.cookie ? { cookie: context.req.headers.cookie } : {}),
        },
        body: JSON.stringify(validatedInput),
      });

      // Call Better Auth handler directly
      const result = await auth.handler(mockRequest);

      // Extract response data
      const responseText = await result.text();
      const data = JSON.parse(responseText);

      // Set cookies from Better Auth response to GraphQL response
      const setCookieHeaders = result.headers.getSetCookie?.() || [];
      if (setCookieHeaders.length > 0) {
        context.res.setHeader('set-cookie', setCookieHeaders);
      }

      // Handle errors
      if (result.status !== 200) {
        this.logger.warn('Sign up failed', {
          email: input.email,
          status: result.status,
          error: data.message,
        });

        // Check for specific error cases
        const errorMessage = data.message || 'Sign up failed';
        if (
          errorMessage.toLowerCase().includes('already exists') ||
          errorMessage.toLowerCase().includes('already registered')
        ) {
          throw new BadRequestError('Email already registered', { email: input.email });
        }

        throw new BadRequestError(errorMessage);
      }

      this.logger.log('Sign up successful', {
        userId: data.user?.id,
        email: input.email,
      });

      // Get session to return complete auth payload
      const session = await auth.api.getSession({
        headers: {
          cookie: setCookieHeaders.join('; '),
        } as any,
      });

      return {
        user: data.user,
        session: session?.session || ({} as any),
        message: 'Sign up successful',
      };
    } catch (error: any) {
      // Handle validation errors
      if (error.name === 'ZodError') {
        this.logger.warn('Sign up validation failed', {
          email: input.email,
          errors: error.errors,
        });
        const fields = error.errors.reduce((acc: any, err: any) => {
          acc[err.path.join('.')] = err.message;
          return acc;
        }, {});
        throw new ValidationError('Invalid input', fields);
      }

      // Re-throw known errors
      if (
        error instanceof AuthenticationError ||
        error instanceof ValidationError ||
        error instanceof BadRequestError
      ) {
        throw error;
      }

      // Log and throw unknown errors
      this.logger.error('Sign up error', error.stack, {
        email: input.email,
        error: error.message,
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
      // Validate input with Zod schema
      const validatedInput = signInSchema.parse({
        email: input.email,
        password: input.password,
      });

      // Create a proper Request-like object for Better Auth
      const baseUrl = process.env.BETTER_AUTH_URL || 'http://localhost:3001';
      const mockRequest = new Request(`${baseUrl}/api/auth/sign-in/email`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          origin: context.req.headers.origin || baseUrl,
          'user-agent': context.req.headers['user-agent'] || 'GraphQL-Client',
          ...(context.req.headers.cookie ? { cookie: context.req.headers.cookie } : {}),
        },
        body: JSON.stringify(validatedInput),
      });

      // Call Better Auth handler directly
      const result = await auth.handler(mockRequest);

      // Extract response data
      const responseText = await result.text();
      const data = JSON.parse(responseText);

      // Set cookies from Better Auth response to GraphQL response
      const setCookieHeaders = result.headers.getSetCookie?.() || [];
      if (setCookieHeaders.length > 0) {
        context.res.setHeader('set-cookie', setCookieHeaders);
      }

      // Handle errors
      if (result.status !== 200) {
        this.logger.warn('Sign in failed', {
          email: input.email,
          status: result.status,
          error: data.message,
        });
        throw new AuthenticationError(data.message || 'Invalid credentials');
      }

      this.logger.log('Sign in successful', {
        userId: data.user?.id,
        email: input.email,
      });

      // Get session to return complete auth payload
      const session = await auth.api.getSession({
        headers: {
          cookie: setCookieHeaders.join('; '),
        } as any,
      });

      return {
        user: data.user,
        session: session?.session || ({} as any),
        message: 'Sign in successful',
      };
    } catch (error: any) {
      // Handle validation errors
      if (error.name === 'ZodError') {
        this.logger.warn('Sign in validation failed', {
          email: input.email,
          errors: error.errors,
        });
        const fields = error.errors.reduce((acc: any, err: any) => {
          acc[err.path.join('.')] = err.message;
          return acc;
        }, {});
        throw new ValidationError('Invalid input', fields);
      }

      // Re-throw known errors
      if (error instanceof AuthenticationError || error instanceof ValidationError) {
        throw error;
      }

      // Log and throw unknown errors
      this.logger.error('Sign in error', error.stack, {
        email: input.email,
        error: error.message,
      });
      throw new AuthenticationError('Sign in failed. Please try again.');
    }
  }

  @Mutation(() => Boolean, { description: 'Sign out the current user' })
  @UseGuards(AuthGuard)
  async signOut(@Context() context: { req: Request; res: Response }): Promise<boolean> {
    const userId = (context.req as any).user?.id;
    this.logger.log('Sign out attempt', { userId });

    try {
      // Create a proper Request-like object for Better Auth
      const baseUrl = process.env.BETTER_AUTH_URL || 'http://localhost:3001';
      const mockRequest = new Request(`${baseUrl}/api/auth/sign-out`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          origin: context.req.headers.origin || baseUrl,
          'user-agent': context.req.headers['user-agent'] || 'GraphQL-Client',
          ...(context.req.headers.cookie ? { cookie: context.req.headers.cookie } : {}),
        },
      });

      // Call Better Auth handler directly
      const result = await auth.handler(mockRequest);

      // Set cookie clearing headers from Better Auth response to GraphQL response
      const setCookieHeaders = result.headers.getSetCookie?.() || [];
      if (setCookieHeaders.length > 0) {
        context.res.setHeader('set-cookie', setCookieHeaders);
      }

      this.logger.log('Sign out successful', { userId });

      return true;
    } catch (error: any) {
      this.logger.error('Sign out error', error.stack, {
        userId,
        error: error.message,
      });
      throw new AuthenticationError('Sign out failed. Please try again.');
    }
  }
}
