import { Injectable } from '@nestjs/common';
import type { IAuthService } from '../../core/abstracts/auth-service.abstract';

@Injectable()
export class ListSessionsUseCase {
  constructor(private readonly authService: IAuthService) {}

  async execute(headers: Record<string, string>): Promise<unknown[]> {
    return this.authService.listSessions(headers);
  }
}
