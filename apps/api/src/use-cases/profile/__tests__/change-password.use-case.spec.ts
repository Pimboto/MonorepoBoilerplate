import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { IAuthService } from '../../../core/abstracts/auth-service.abstract';
import { ChangePasswordUseCase } from '../change-password.use-case';

function createMockAuthService(): IAuthService {
  return {
    changePassword: vi.fn(),
    listSessions: vi.fn(),
    revokeSession: vi.fn(),
  } as unknown as IAuthService;
}

describe('ChangePasswordUseCase', () => {
  let useCase: ChangePasswordUseCase;
  let mockAuthService: IAuthService;

  beforeEach(() => {
    mockAuthService = createMockAuthService();
    useCase = new ChangePasswordUseCase(mockAuthService);
  });

  it('should delegate to IAuthService.changePassword with the correct arguments', async () => {
    vi.mocked(mockAuthService.changePassword).mockResolvedValue(undefined);

    const headers = { cookie: 'session=abc123' };

    await useCase.execute(headers, 'old-password', 'new-password');

    expect(mockAuthService.changePassword).toHaveBeenCalledWith(
      headers,
      'old-password',
      'new-password',
    );
    expect(mockAuthService.changePassword).toHaveBeenCalledTimes(1);
  });

  it('should propagate errors from the auth service', async () => {
    const authError = new Error('Invalid current password');
    vi.mocked(mockAuthService.changePassword).mockRejectedValue(authError);

    const headers = { cookie: 'session=abc123' };

    await expect(useCase.execute(headers, 'wrong-password', 'new-password')).rejects.toThrow(
      'Invalid current password',
    );
  });
});
