import { signUpSchema } from '@cocostudio/shared';
import { Injectable } from '@nestjs/common';
import { IAuthService } from '../../core/abstracts/auth-service.abstract';
import { ValidationError } from '../../core/errors';

@Injectable()
export class SignUpUseCase {
  constructor(private readonly authService: IAuthService) {}

  async execute(
    input: { email: string; password: string; name: string },
    headers: Record<string, string>,
  ): Promise<{ user: unknown; session: unknown; setCookieHeaders: string[] }> {
    const result = signUpSchema.safeParse(input);
    if (!result.success) {
      const fields: Record<string, string> = {};
      for (const err of result.error.errors) {
        fields[err.path.join('.')] = err.message;
      }
      throw new ValidationError('Invalid input', fields);
    }

    return this.authService.signUp(result.data, headers);
  }
}
