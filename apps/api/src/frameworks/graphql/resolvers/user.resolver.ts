import type { User } from '@cocostudio/database';
import { UseGuards } from '@nestjs/common';
import { Query, Resolver } from '@nestjs/graphql';
import { AuthGuard } from '../../auth/auth.guard';
import { CurrentUser } from '../../auth/current-user.decorator';
import { InternalServerError } from '../errors/auth.error';
import { UserType } from '../types/user.type';

@Resolver(() => UserType)
export class UserResolver {
  @Query(() => UserType, { name: 'me' })
  @UseGuards(AuthGuard)
  async getMe(@CurrentUser() user: User): Promise<UserType> {
    try {
      return user as unknown as UserType;
    } catch {
      throw new InternalServerError('Failed to retrieve current user');
    }
  }
}
