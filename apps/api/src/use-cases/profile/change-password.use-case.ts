import { Injectable } from '@nestjs/common';
import { IAuthService } from '../../core/abstracts/auth-service.abstract';

@Injectable()
export class ChangePasswordUseCase {
  constructor(private readonly authService: IAuthService) {}

  async execute(
    headers: Record<string, string>,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    await this.authService.changePassword(headers, currentPassword, newPassword);
  }
}
