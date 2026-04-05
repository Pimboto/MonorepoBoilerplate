export abstract class IAuthService {
  abstract signUp(
    input: { email: string; password: string; name: string },
    headers: Record<string, string>,
  ): Promise<{ user: unknown; session: unknown; setCookieHeaders: string[] }>;

  abstract signIn(
    input: { email: string; password: string },
    headers: Record<string, string>,
  ): Promise<{ user: unknown; session: unknown; setCookieHeaders: string[] }>;

  abstract signOut(headers: Record<string, string>): Promise<{ setCookieHeaders: string[] }>;

  abstract changePassword(
    headers: Record<string, string>,
    currentPassword: string,
    newPassword: string,
  ): Promise<void>;

  abstract listSessions(headers: Record<string, string>): Promise<unknown[]>;

  abstract revokeSession(headers: Record<string, string>, token: string): Promise<void>;

  abstract sendVerificationOtp(
    email: string,
    type: string,
    headers: Record<string, string>,
  ): Promise<void>;

  abstract verifyEmail(
    email: string,
    otp: string,
    headers: Record<string, string>,
  ): Promise<{ setCookieHeaders: string[] }>;

  abstract requestPasswordReset(email: string, headers: Record<string, string>): Promise<boolean>;

  abstract resetPassword(
    email: string,
    otp: string,
    password: string,
    headers: Record<string, string>,
  ): Promise<void>;
}
