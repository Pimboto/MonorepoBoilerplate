import { sendVerificationOtpSchema } from '@cocostudio/shared';
import { Injectable } from '@nestjs/common';
import { IAuthService } from '../../core/abstracts/auth-service.abstract';
import { ValidationError } from '../../core/errors';

@Injectable()
export class SendVerificationOtpUseCase {
  constructor(private readonly authService: IAuthService) {}

  async execute(
    input: { email: string; type: string },
    headers: Record<string, string>,
  ): Promise<void> {
    const result = sendVerificationOtpSchema.safeParse(input);
    if (!result.success) {
      const fields: Record<string, string> = {};
      for (const err of result.error.errors) {
        fields[err.path.join('.')] = err.message;
      }
      throw new ValidationError('Invalid input', fields);
    }

    await this.authService.sendVerificationOtp(result.data.email, result.data.type, headers);
  }
}
