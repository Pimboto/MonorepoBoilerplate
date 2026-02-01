import { User } from '@cocostudio/database';
import { UseGuards } from '@nestjs/common';
import { Query, Resolver } from '@nestjs/graphql';
import { AuthGuard } from '../../auth/auth.guard';
import { CurrentUser } from '../../auth/current-user.decorator';
import { UserType } from '../types/user.type';

@Resolver(() => UserType)
export class UserResolver {
  @Query(() => String, { name: 'hello' })
  async hello(): Promise<string> {
    return 'Hello World!';
  }

  @Query(() => UserType, { name: 'me' })
  @UseGuards(AuthGuard)
  async getMe(@CurrentUser() user: User): Promise<UserType> {
    return user as unknown as UserType;
  }
}
