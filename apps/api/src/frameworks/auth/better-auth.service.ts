import { auth } from '@cocostudio/database';
import { Injectable } from '@nestjs/common';
import { IAuthService } from '../../core/abstracts/auth-service.abstract';
import { AuthenticationError, BadRequestError, InternalServerError } from '../../core/errors';

/** Shape returned by Better Auth sign-up / sign-in endpoints. */
interface BetterAuthResponseData {
  user?: { id: string; email: string; name: string };
  message?: string;
}

@Injectable()
export class BetterAuthService extends IAuthService {
  private get baseUrl(): string {
    return process.env.BETTER_AUTH_URL || 'http://localhost:3001';
  }

  private buildRequestHeaders(headers: Record<string, string>): Record<string, string> {
    return {
      'content-type': 'application/json',
      origin: headers.origin || this.baseUrl,
      'user-agent': headers['user-agent'] || 'GraphQL-Client',
      ...(headers.cookie ? { cookie: headers.cookie } : {}),
    };
  }

  async signUp(
    input: { email: string; password: string; name: string },
    headers: Record<string, string>,
  ): Promise<{ user: unknown; session: unknown; setCookieHeaders: string[] }> {
    const mockRequest = new Request(`${this.baseUrl}/api/auth/sign-up/email`, {
      method: 'POST',
      headers: this.buildRequestHeaders(headers),
      body: JSON.stringify(input),
    });

    const result = await auth.handler(mockRequest);
    const responseText = await result.text();
    const data: BetterAuthResponseData = JSON.parse(responseText);

    const setCookieHeaders = result.headers.getSetCookie?.() || [];

    if (result.status !== 200) {
      const errorMessage = data.message || 'Sign up failed';
      if (
        errorMessage.toLowerCase().includes('already exists') ||
        errorMessage.toLowerCase().includes('already registered')
      ) {
        throw new BadRequestError('Email already registered', { email: input.email });
      }
      throw new BadRequestError(errorMessage);
    }

    if (!data.user) {
      throw new InternalServerError('Sign up succeeded but no user was returned');
    }

    // When requireEmailVerification is enabled, Better Auth does NOT create a session
    // until the email is verified. Session may be null here — that's expected.
    let session: unknown = null;
    if (setCookieHeaders.length > 0) {
      const sessionHeaders = new Headers({ cookie: setCookieHeaders.join('; ') });
      const sessionData = await auth.api.getSession({ headers: sessionHeaders });
      session = sessionData?.session ?? null;
    }

    return { user: data.user, session, setCookieHeaders };
  }

  async signIn(
    input: { email: string; password: string },
    headers: Record<string, string>,
  ): Promise<{ user: unknown; session: unknown; setCookieHeaders: string[] }> {
    const mockRequest = new Request(`${this.baseUrl}/api/auth/sign-in/email`, {
      method: 'POST',
      headers: this.buildRequestHeaders(headers),
      body: JSON.stringify(input),
    });

    const result = await auth.handler(mockRequest);
    const responseText = await result.text();
    const data: BetterAuthResponseData = JSON.parse(responseText);

    const setCookieHeaders = result.headers.getSetCookie?.() || [];

    if (result.status !== 200) {
      throw new AuthenticationError(data.message || 'Invalid credentials');
    }

    if (!data.user) {
      throw new AuthenticationError('Sign in succeeded but no user was returned');
    }

    const sessionHeaders = new Headers({ cookie: setCookieHeaders.join('; ') });
    const session = await auth.api.getSession({ headers: sessionHeaders });

    if (!session?.session) {
      throw new AuthenticationError('Sign in succeeded but no session was created');
    }

    return { user: data.user, session: session.session, setCookieHeaders };
  }

  async signOut(headers: Record<string, string>): Promise<{ setCookieHeaders: string[] }> {
    const mockRequest = new Request(`${this.baseUrl}/api/auth/sign-out`, {
      method: 'POST',
      headers: this.buildRequestHeaders(headers),
    });

    const result = await auth.handler(mockRequest);
    const setCookieHeaders = result.headers.getSetCookie?.() || [];

    return { setCookieHeaders };
  }

  async changePassword(
    headers: Record<string, string>,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const mockRequest = new Request(`${this.baseUrl}/api/auth/change-password`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...headers,
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    const result = await auth.handler(mockRequest);

    if (result.status !== 200) {
      const data = (await result.json()) as { message?: string };
      throw new BadRequestError(data.message || 'Failed to change password');
    }
  }

  async listSessions(headers: Record<string, string>): Promise<unknown[]> {
    const sessions = await auth.api.listSessions({
      headers: headers as unknown as Headers,
    });
    return (sessions || []) as unknown[];
  }

  async revokeSession(headers: Record<string, string>, token: string): Promise<void> {
    await auth.api.revokeSession({
      headers: headers as unknown as Headers,
      body: { token },
    });
  }

  async sendVerificationOtp(
    email: string,
    type: string,
    headers: Record<string, string>,
  ): Promise<void> {
    const mockRequest = new Request(`${this.baseUrl}/api/auth/email-otp/send-verification-otp`, {
      method: 'POST',
      headers: this.buildRequestHeaders(headers),
      body: JSON.stringify({ email, type }),
    });

    const result = await auth.handler(mockRequest);

    if (result.status !== 200) {
      const data = (await result.json()) as { message?: string };
      throw new BadRequestError(data.message || 'Failed to send verification OTP');
    }
  }

  async verifyEmail(
    email: string,
    otp: string,
    headers: Record<string, string>,
  ): Promise<{ setCookieHeaders: string[] }> {
    const mockRequest = new Request(`${this.baseUrl}/api/auth/email-otp/verify-email`, {
      method: 'POST',
      headers: this.buildRequestHeaders(headers),
      body: JSON.stringify({ email, otp }),
    });

    const result = await auth.handler(mockRequest);
    const setCookieHeaders = result.headers.getSetCookie?.() || [];

    if (result.status !== 200) {
      const data = (await result.json()) as { message?: string };
      throw new BadRequestError(data.message || 'Invalid or expired OTP');
    }

    return { setCookieHeaders };
  }

  async requestPasswordReset(email: string, headers: Record<string, string>): Promise<boolean> {
    const mockRequest = new Request(`${this.baseUrl}/api/auth/email-otp/forget-password`, {
      method: 'POST',
      headers: this.buildRequestHeaders(headers),
      body: JSON.stringify({ email }),
    });

    const result = await auth.handler(mockRequest);

    return result.status === 200;
  }

  async resetPassword(
    email: string,
    otp: string,
    password: string,
    headers: Record<string, string>,
  ): Promise<void> {
    const mockRequest = new Request(`${this.baseUrl}/api/auth/email-otp/reset-password`, {
      method: 'POST',
      headers: this.buildRequestHeaders(headers),
      body: JSON.stringify({ email, otp, password }),
    });

    const result = await auth.handler(mockRequest);

    if (result.status !== 200) {
      const data = (await result.json()) as { message?: string };
      throw new BadRequestError(data.message || 'Failed to reset password');
    }
  }
}
