import { auth, prisma } from '@cocostudio/database';
import { changePasswordSchema, updateProfileSchema } from '@cocostudio/shared';
import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import type { Request, Response } from 'express';
import { IStorageService } from '../../../core/abstracts/storage-service.abstract';
import { AuthGuard } from '../../auth/auth.guard';
import { CurrentUser } from '../../auth/current-user.decorator';
import { LoggerService } from '../../logger';
import { BadRequestError, InternalServerError, ValidationError } from '../errors/auth.error';
import { MySessionsResponse } from '../types/my-sessions.response';
import { ChangePasswordInput, UpdateProfileInput } from '../types/profile.input';
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
    private readonly storageService: IStorageService,
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
      const validated = updateProfileSchema.parse(input);

      // Delete old profile image from UploadThing if replacing with a new one
      if (validated.image) {
        const currentUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { image: true },
        });
        if (currentUser?.image) {
          try {
            const oldKey = currentUser.image.split('/').pop();
            if (oldKey) {
              await this.storageService.deleteFile(oldKey);
            }
          } catch {
            this.logger.warn('Failed to delete old profile image from storage', {
              userId: user.id,
            });
          }
        }
      }

      const updated = await prisma.user.update({
        where: { id: user.id },
        data: {
          ...(validated.name !== undefined && { name: validated.name }),
          ...(validated.image !== undefined && { image: validated.image }),
        },
      });

      this.logger.log('Profile updated', { userId: user.id });
      return updated as unknown as UserType;
    } catch (error: unknown) {
      const err = error as { name?: string; errors?: { path: string[]; message: string }[] };
      if (err.name === 'ZodError' && err.errors) {
        const fields: Record<string, string> = {};
        for (const e of err.errors) {
          fields[e.path.join('.')] = e.message;
        }
        throw new ValidationError('Invalid input', fields);
      }
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
      changePasswordSchema.parse(input);

      const baseUrl = process.env.BETTER_AUTH_URL || 'http://localhost:3001';
      const mockRequest = new Request(`${baseUrl}/api/auth/change-password`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          origin: context.req.headers.origin || baseUrl,
          ...(context.req.headers.cookie ? { cookie: context.req.headers.cookie } : {}),
        },
        body: JSON.stringify({
          currentPassword: input.currentPassword,
          newPassword: input.newPassword,
        }),
      });

      const result = await auth.handler(mockRequest);

      if (result.status !== 200) {
        const data = await result.json();
        throw new BadRequestError(
          (data as { message?: string }).message || 'Failed to change password',
        );
      }

      this.logger.log('Password changed', { userId: user.id });
      return true;
    } catch (error: unknown) {
      if (error instanceof BadRequestError || error instanceof ValidationError) {
        throw error;
      }
      const err = error as { name?: string; errors?: { path: string[]; message: string }[] };
      if (err.name === 'ZodError' && err.errors) {
        const fields: Record<string, string> = {};
        for (const e of err.errors) {
          fields[e.path.join('.')] = e.message;
        }
        throw new ValidationError('Invalid input', fields);
      }
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
      const sessions = await auth.api.listSessions({
        headers: context.req.headers as unknown as Headers,
      });

      const currentToken = (context.req as { session?: { token?: string } }).session?.token || '';

      return {
        sessions: (sessions || []) as unknown as MySessionsResponse['sessions'],
        currentSessionToken: currentToken,
      };
    } catch (error: unknown) {
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
      await auth.api.revokeSession({
        headers: context.req.headers as unknown as Headers,
        body: { token: sessionToken },
      });

      this.logger.log('Session revoked', { userId: user.id });
      return true;
    } catch (error: unknown) {
      this.logger.error('Revoke session error', (error as Error).stack, {
        userId: user.id,
      });
      throw new InternalServerError('Failed to revoke session');
    }
  }
}
