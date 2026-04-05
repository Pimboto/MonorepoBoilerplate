import { Injectable } from '@nestjs/common';
import { IAuthService } from '../../core/abstracts/auth-service.abstract';

@Injectable()
export class RevokeSessionUseCase {
  constructor(private readonly authService: IAuthService) {}

  async execute(headers: Record<string, string>, token: string): Promise<void> {
    await this.authService.revokeSession(headers, token);
  }
}
