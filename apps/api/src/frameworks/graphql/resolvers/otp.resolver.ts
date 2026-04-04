import { auth } from '@cocostudio/database';
import {
  requestPasswordResetSchema,
  resetPasswordSchema,
  sendVerificationOtpSchema,
  verifyEmailSchema,
} from '@cocostudio/shared';
import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import type { Request, Response } from 'express';
import { LoggerService } from '../../logger';
import { BadRequestError, InternalServerError, ValidationError } from '../errors/auth.error';
import {
  RequestPasswordResetInput,
  ResetPasswordInput,
  SendVerificationOtpInput,
  VerifyEmailInput,
} from '../types/otp.input';

@Resolver()
export class OtpResolver {
  constructor(private readonly logger: LoggerService) {
    this.logger.setContext('OtpResolver');
  }

  private getBaseUrl(): string {
    return process.env.BETTER_AUTH_URL || 'http://localhost:3001';
  }

  private buildHeaders(req: Request): Record<string, string> {
    const baseUrl = this.getBaseUrl();
    return {
      'content-type': 'application/json',
      origin: req.headers.origin || baseUrl,
      'user-agent': req.headers['user-agent'] || 'GraphQL-Client',
      ...(req.headers.cookie ? { cookie: req.headers.cookie } : {}),
    };
  }

  @Mutation(() => Boolean, { description: 'Send a verification OTP to an email address' })
  async sendVerificationOtp(
    @Args('input') input: SendVerificationOtpInput,
    @Context() context: { req: Request; res: Response },
  ): Promise<boolean> {
    this.logger.log('Send verification OTP attempt', { email: input.email, type: input.type });

    try {
      const validated = sendVerificationOtpSchema.parse(input);

      const baseUrl = this.getBaseUrl();
      const mockRequest = new Request(`${baseUrl}/api/auth/email-otp/send-verification-otp`, {
        method: 'POST',
        headers: this.buildHeaders(context.req),
        body: JSON.stringify({
          email: validated.email,
          type: validated.type,
        }),
      });

      const result = await auth.handler(mockRequest);

      if (result.status !== 200) {
        const data = (await result.json()) as { message?: string };
        throw new BadRequestError(data.message || 'Failed to send verification OTP');
      }

      this.logger.log('Verification OTP sent', { email: input.email });
      return true;
    } catch (error: unknown) {
      if (error instanceof BadRequestError || error instanceof ValidationError) {
        throw error;
      }
      const err = error as { name?: string; errors?: { path: string[]; message: string }[] };
      if (err.name === 'ZodError' && err.errors) {
        const fields: Record<string, string> = {};
        for (const e of err.errors) {
          fields[e.path.join('.')] = e.message;
        }
        throw new ValidationError('Invalid input', fields);
      }
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
      const validated = verifyEmailSchema.parse(input);

      const baseUrl = this.getBaseUrl();
      const mockRequest = new Request(`${baseUrl}/api/auth/email-otp/verify-email`, {
        method: 'POST',
        headers: this.buildHeaders(context.req),
        body: JSON.stringify({
          email: validated.email,
          otp: validated.otp,
        }),
      });

      const result = await auth.handler(mockRequest);

      // Forward any cookies (session may be updated)
      const setCookieHeaders = result.headers.getSetCookie?.() || [];
      if (setCookieHeaders.length > 0) {
        context.res.setHeader('set-cookie', setCookieHeaders);
      }

      if (result.status !== 200) {
        const data = (await result.json()) as { message?: string };
        throw new BadRequestError(data.message || 'Invalid or expired OTP');
      }

      this.logger.log('Email verified', { email: input.email });
      return true;
    } catch (error: unknown) {
      if (error instanceof BadRequestError || error instanceof ValidationError) {
        throw error;
      }
      const err = error as { name?: string; errors?: { path: string[]; message: string }[] };
      if (err.name === 'ZodError' && err.errors) {
        const fields: Record<string, string> = {};
        for (const e of err.errors) {
          fields[e.path.join('.')] = e.message;
        }
        throw new ValidationError('Invalid input', fields);
      }
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
      const validated = requestPasswordResetSchema.parse(input);

      const baseUrl = this.getBaseUrl();
      const mockRequest = new Request(`${baseUrl}/api/auth/email-otp/forget-password`, {
        method: 'POST',
        headers: this.buildHeaders(context.req),
        body: JSON.stringify({
          email: validated.email,
        }),
      });

      const result = await auth.handler(mockRequest);

      if (result.status !== 200) {
        // Don't reveal whether email exists — always return true
        this.logger.warn('Password reset OTP send failed (silent)', { email: input.email });
      }

      // Always return true to prevent email enumeration
      this.logger.log('Password reset OTP sent (or silently failed)', { email: input.email });
      return true;
    } catch (error: unknown) {
      if (error instanceof ValidationError) {
        throw error;
      }
      const err = error as { name?: string; errors?: { path: string[]; message: string }[] };
      if (err.name === 'ZodError' && err.errors) {
        const fields: Record<string, string> = {};
        for (const e of err.errors) {
          fields[e.path.join('.')] = e.message;
        }
        throw new ValidationError('Invalid input', fields);
      }
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
      const validated = resetPasswordSchema.parse(input);

      const baseUrl = this.getBaseUrl();
      const mockRequest = new Request(`${baseUrl}/api/auth/email-otp/reset-password`, {
        method: 'POST',
        headers: this.buildHeaders(context.req),
        body: JSON.stringify({
          email: validated.email,
          otp: validated.otp,
          password: validated.newPassword,
        }),
      });

      const result = await auth.handler(mockRequest);

      if (result.status !== 200) {
        const data = (await result.json()) as { message?: string };
        throw new BadRequestError(data.message || 'Failed to reset password');
      }

      this.logger.log('Password reset successful', { email: input.email });
      return true;
    } catch (error: unknown) {
      if (error instanceof BadRequestError || error instanceof ValidationError) {
        throw error;
      }
      const err = error as { name?: string; errors?: { path: string[]; message: string }[] };
      if (err.name === 'ZodError' && err.errors) {
        const fields: Record<string, string> = {};
        for (const e of err.errors) {
          fields[e.path.join('.')] = e.message;
        }
        throw new ValidationError('Invalid input', fields);
      }
      this.logger.error('Reset password error', (error as Error).stack, {
        email: input.email,
      });
      throw new InternalServerError('Failed to reset password');
    }
  }
}
