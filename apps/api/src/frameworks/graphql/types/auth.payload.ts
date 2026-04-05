import { Field, ObjectType } from '@nestjs/graphql';
import { SessionType } from './session.type';
import { UserType } from './user.type';

@ObjectType()
export class AuthPayload {
  @Field(() => UserType)
  user: UserType;

  @Field(() => SessionType, { nullable: true })
  session?: SessionType | null;

  @Field()
  message: string;
}
