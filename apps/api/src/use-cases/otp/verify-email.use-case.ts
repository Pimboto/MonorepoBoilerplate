import { verifyEmailSchema } from '@cocostudio/shared';
import { Injectable } from '@nestjs/common';
import { IAuthService } from '../../core/abstracts/auth-service.abstract';
import { ValidationError } from '../../core/errors';

@Injectable()
export class VerifyEmailUseCase {
  constructor(private readonly authService: IAuthService) {}

  async execute(
    input: { email: string; otp: string },
    headers: Record<string, string>,
  ): Promise<{ setCookieHeaders: string[] }> {
    const result = verifyEmailSchema.safeParse(input);
    if (!result.success) {
      const fields: Record<string, string> = {};
      for (const err of result.error.errors) {
        fields[err.path.join('.')] = err.message;
      }
      throw new ValidationError('Invalid input', fields);
    }

    return this.authService.verifyEmail(result.data.email, result.data.otp, headers);
  }
}
