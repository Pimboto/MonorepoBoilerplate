import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import type { Request, Response } from 'express';
import { DomainError } from '../../../core/errors';
import type { RequestPasswordResetUseCase } from '../../../use-cases/otp/request-password-reset.use-case';
import type { ResetPasswordUseCase } from '../../../use-cases/otp/reset-password.use-case';
import type { SendVerificationOtpUseCase } from '../../../use-cases/otp/send-verification-otp.use-case';
import type { VerifyEmailUseCase } from '../../../use-cases/otp/verify-email.use-case';
import type { LoggerService } from '../../logger';
import { InternalServerError, toGraphQLError } from '../errors/auth.error';
import type {
  RequestPasswordResetInput,
  ResetPasswordInput,
  SendVerificationOtpInput,
  VerifyEmailInput,
} from '../types/otp.input';

@Resolver()
export class OtpResolver {
  constructor(
    private readonly logger: LoggerService,
    private readonly sendVerificationOtpUseCase: SendVerificationOtpUseCase,
    private readonly verifyEmailUseCase: VerifyEmailUseCase,
    private readonly requestPasswordResetUseCase: RequestPasswordResetUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
  ) {
    this.logger.setContext('OtpResolver');
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

  @Mutation(() => Boolean, { description: 'Send a verification OTP to an email address' })
  async sendVerificationOtp(
    @Args('input') input: SendVerificationOtpInput,
    @Context() context: { req: Request; res: Response },
  ): Promise<boolean> {
    this.logger.log('Send verification OTP attempt', { email: input.email, type: input.type });

    try {
      const headers = this.extractHeaders(context.req);
      await this.sendVerificationOtpUseCase.execute(
        { email: input.email, type: input.type },
        headers,
      );

      this.logger.log('Verification OTP sent', { email: input.email });
      return true;
    } catch (error: unknown) {
      if (error instanceof DomainError) throw toGraphQLError(error);
      this.logger.error('Send verification OTP error', (error as Error).stack, {
        email: input.email,
      });
      throw new InternalServerError('Failed to send verification OTP');
    }
  }

  @Mutation(() => Boolean, { description: 'Verify email address with OTP' })
  async verifyEmail(
    @Args('input') input: VerifyEmailInput,
    @Context() context: { req: Request; res: Response },
  ): Promise<boolean> {
    this.logger.log('Verify email attempt', { email: input.email });

    try {
      const headers = this.extractHeaders(context.req);
      const result = await this.verifyEmailUseCase.execute(
        { email: input.email, otp: input.otp },
        headers,
      );

      this.setCookies(context.res, result.setCookieHeaders);

      this.logger.log('Email verified', { email: input.email });
      return true;
    } catch (error: unknown) {
      if (error instanceof DomainError) throw toGraphQLError(error);
      this.logger.error('Verify email error', (error as Error).stack, {
        email: input.email,
      });
      throw new InternalServerError('Failed to verify email');
    }
  }

  @Mutation(() => Boolean, { description: 'Request a password reset OTP' })
  async requestPasswordReset(
    @Args('input') input: RequestPasswordResetInput,
    @Context() context: { req: Request; res: Response },
  ): Promise<boolean> {
    this.logger.log('Password reset request', { email: input.email });

    try {
      const headers = this.extractHeaders(context.req);
      await this.requestPasswordResetUseCase.execute({ email: input.email }, headers);

      this.logger.log('Password reset OTP sent', { email: input.email });
      // Always return true to prevent email enumeration
      return true;
    } catch (error: unknown) {
      if (error instanceof DomainError) throw toGraphQLError(error);
      this.logger.error('Password reset request error', (error as Error).stack, {
        email: input.email,
      });
      // Still return true to prevent email enumeration
      return true;
    }
  }

  @Mutation(() => Boolean, { description: 'Reset password using OTP' })
  async resetPassword(
    @Args('input') input: ResetPasswordInput,
    @Context() context: { req: Request; res: Response },
  ): Promise<boolean> {
    this.logger.log('Reset password attempt', { email: input.email });

    try {
      const headers = this.extractHeaders(context.req);
      await this.resetPasswordUseCase.execute(
        { email: input.email, otp: input.otp, newPassword: input.newPassword },
        headers,
      );

      this.logger.log('Password reset successful', { email: input.email });
      return true;
    } catch (error: unknown) {
      if (error instanceof DomainError) throw toGraphQLError(error);
      this.logger.error('Reset password error', (error as Error).stack, {
        email: input.email,
      });
      throw new InternalServerError('Failed to reset password');
    }
  }
}
