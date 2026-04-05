import { requestPasswordResetSchema } from '@cocostudio/shared';
import { Injectable } from '@nestjs/common';
import type { IAuthService } from '../../core/abstracts/auth-service.abstract';
import { ValidationError } from '../../core/errors';

@Injectable()
export class RequestPasswordResetUseCase {
  constructor(private readonly authService: IAuthService) {}

  async execute(input: { email: string }, headers: Record<string, string>): Promise<boolean> {
    const result = requestPasswordResetSchema.safeParse(input);
    if (!result.success) {
      const fields: Record<string, string> = {};
      for (const err of result.error.errors) {
        fields[err.path.join('.')] = err.message;
      }
      throw new ValidationError('Invalid input', fields);
    }

    return this.authService.requestPasswordReset(result.data.email, headers);
  }
}
