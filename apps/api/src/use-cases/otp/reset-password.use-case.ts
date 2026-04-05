import { resetPasswordSchema } from '@cocostudio/shared';
import { Injectable } from '@nestjs/common';
import { IAuthService } from '../../core/abstracts/auth-service.abstract';
import { ValidationError } from '../../core/errors';

@Injectable()
export class ResetPasswordUseCase {
  constructor(private readonly authService: IAuthService) {}

  async execute(
    input: { email: string; otp: string; newPassword: string },
    headers: Record<string, string>,
  ): Promise<void> {
    const result = resetPasswordSchema.safeParse(input);
    if (!result.success) {
      const fields: Record<string, string> = {};
      for (const err of result.error.errors) {
        fields[err.path.join('.')] = err.message;
      }
      throw new ValidationError('Invalid input', fields);
    }

    await this.authService.resetPassword(
      result.data.email,
      result.data.otp,
      result.data.newPassword,
      headers,
    );
  }
}
