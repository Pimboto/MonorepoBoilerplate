import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import type { Request, Response } from 'express';
import { DomainError } from '../../../core/errors';
import type { ChangePasswordUseCase } from '../../../use-cases/profile/change-password.use-case';
import type { ListSessionsUseCase } from '../../../use-cases/profile/list-sessions.use-case';
import type { RevokeSessionUseCase } from '../../../use-cases/profile/revoke-session.use-case';
import type { UpdateProfileUseCase } from '../../../use-cases/profile/update-profile.use-case';
import { AuthGuard } from '../../auth/auth.guard';
import { CurrentUser } from '../../auth/current-user.decorator';
import type { LoggerService } from '../../logger';
import { InternalServerError, toGraphQLError } from '../errors/auth.error';
import { MySessionsResponse } from '../types/my-sessions.response';
import type { ChangePasswordInput, UpdateProfileInput } from '../types/profile.input';
import { UserType } from '../types/user.type';

interface AuthUser {
  id: string;
  email: string;
  name: string;
}

@Resolver()
@UseGuards(AuthGuard)
export class ProfileResolver {
  constructor(
    private readonly logger: LoggerService,
    private readonly updateProfileUseCase: UpdateProfileUseCase,
    private readonly changePasswordUseCase: ChangePasswordUseCase,
    private readonly listSessionsUseCase: ListSessionsUseCase,
    private readonly revokeSessionUseCase: RevokeSessionUseCase,
  ) {
    this.logger.setContext('ProfileResolver');
  }

  @Mutation(() => UserType, { description: 'Update user profile (name, image)' })
  async updateProfile(
    @Args('input') input: UpdateProfileInput,
    @CurrentUser() user: AuthUser,
  ): Promise<UserType> {
    this.logger.log('Update profile attempt', { userId: user.id });

    try {
      const updated = await this.updateProfileUseCase.execute(user.id, input);
      this.logger.log('Profile updated', { userId: user.id });
      return updated as unknown as UserType;
    } catch (error: unknown) {
      if (error instanceof DomainError) throw toGraphQLError(error);
      this.logger.error('Update profile error', (error as Error).stack, {
        userId: user.id,
      });
      throw new InternalServerError('Failed to update profile');
    }
  }

  @Mutation(() => Boolean, { description: 'Change password' })
  async changePassword(
    @Args('input') input: ChangePasswordInput,
    @Context() context: { req: Request; res: Response },
    @CurrentUser() user: AuthUser,
  ): Promise<boolean> {
    this.logger.log('Change password attempt', { userId: user.id });

    try {
      const baseUrl = process.env.BETTER_AUTH_URL || 'http://localhost:3001';
      const headers: Record<string, string> = {
        origin: (context.req.headers.origin as string) || baseUrl,
        ...(context.req.headers.cookie ? { cookie: context.req.headers.cookie } : {}),
      };

      await this.changePasswordUseCase.execute(headers, input.currentPassword, input.newPassword);

      this.logger.log('Password changed', { userId: user.id });
      return true;
    } catch (error: unknown) {
      if (error instanceof DomainError) throw toGraphQLError(error);
      this.logger.error('Change password error', (error as Error).stack, {
        userId: user.id,
      });
      throw new InternalServerError('Failed to change password');
    }
  }

  @Query(() => MySessionsResponse, {
    name: 'mySessions',
    description: 'List active sessions with current session identifier',
  })
  async mySessions(@Context() context: { req: Request }): Promise<MySessionsResponse> {
    try {
      const headers = context.req.headers as unknown as Record<string, string>;
      const sessions = await this.listSessionsUseCase.execute(headers);
      const currentToken = (context.req as { session?: { token?: string } }).session?.token || '';

      return {
        sessions: sessions as unknown as MySessionsResponse['sessions'],
        currentSessionToken: currentToken,
      };
    } catch (error: unknown) {
      if (error instanceof DomainError) throw toGraphQLError(error);
      this.logger.error('List sessions error', (error as Error).stack);
      throw new InternalServerError('Failed to list sessions');
    }
  }

  @Mutation(() => Boolean, { description: 'Revoke a session by token' })
  async revokeSession(
    @Args('sessionToken') sessionToken: string,
    @Context() context: { req: Request },
    @CurrentUser() user: AuthUser,
  ): Promise<boolean> {
    this.logger.log('Revoke session attempt', { userId: user.id });

    try {
      const headers = context.req.headers as unknown as Record<string, string>;
      await this.revokeSessionUseCase.execute(headers, sessionToken);

      this.logger.log('Session revoked', { userId: user.id });
      return true;
    } catch (error: unknown) {
      if (error instanceof DomainError) throw toGraphQLError(error);
      this.logger.error('Revoke session error', (error as Error).stack, {
        userId: user.id,
      });
      throw new InternalServerError('Failed to revoke session');
    }
  }
}
