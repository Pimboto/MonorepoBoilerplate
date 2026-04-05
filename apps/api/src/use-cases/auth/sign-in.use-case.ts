import { signInSchema } from '@cocostudio/shared';
import { Injectable } from '@nestjs/common';
import type { IAuthService } from '../../core/abstracts/auth-service.abstract';
import { ValidationError } from '../../core/errors';

@Injectable()
export class SignInUseCase {
  constructor(private readonly authService: IAuthService) {}

  async execute(
    input: { email: string; password: string },
    headers: Record<string, string>,
  ): Promise<{ user: unknown; session: unknown; setCookieHeaders: string[] }> {
    const result = signInSchema.safeParse(input);
    if (!result.success) {
      const fields: Record<string, string> = {};
      for (const err of result.error.errors) {
        fields[err.path.join('.')] = err.message;
      }
      throw new ValidationError('Invalid input', fields);
    }

    return this.authService.signIn(result.data, headers);
  }
}
