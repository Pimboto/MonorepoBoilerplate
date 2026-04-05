import { Injectable } from '@nestjs/common';
import type { IAuthService } from '../../core/abstracts/auth-service.abstract';

@Injectable()
export class SignOutUseCase {
  constructor(private readonly authService: IAuthService) {}

  async execute(headers: Record<string, string>): Promise<{ setCookieHeaders: string[] }> {
    return this.authService.signOut(headers);
  }
}
