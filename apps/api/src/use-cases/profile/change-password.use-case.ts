import { changePasswordSchema } from '@cocostudio/shared';
import { Injectable } from '@nestjs/common';
import type { IAuthService } from '../../core/abstracts/auth-service.abstract';
import { ValidationError } from '../../core/errors';

@Injectable()
export class ChangePasswordUseCase {
  constructor(private readonly authService: IAuthService) {}

  async execute(
    headers: Record<string, string>,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const result = changePasswordSchema.safeParse({ currentPassword, newPassword });
    if (!result.success) {
      const fields: Record<string, string> = {};
      for (const err of result.error.errors) {
        fields[err.path.join('.')] = err.message;
      }
      throw new ValidationError('Invalid input', fields);
    }

    await this.authService.changePassword(headers, currentPassword, newPassword);
  }
}
