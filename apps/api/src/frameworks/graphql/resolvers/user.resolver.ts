import { UseGuards } from '@nestjs/common';
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthGuard } from '../../auth/auth.guard';
import { CurrentUser } from '../../auth/current-user.decorator';
import { UserType } from '../types/user.type'; // Ensure this path is correct

@Resolver(() => UserType)
export class UserResolver {
  constructor() {}

  @Query(() => String, { name: 'hello' })
  async hello(): Promise<string> {
    return 'Hello World!';
  }

  @Query(() => UserType, { name: 'me' })
  @UseGuards(AuthGuard)
  async getMe(@CurrentUser() user: any): Promise<UserType> {
    return user;
  }
}
