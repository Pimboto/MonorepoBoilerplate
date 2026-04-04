import { Field, ObjectType } from '@nestjs/graphql';
import { SessionType } from './session.type';

@ObjectType({ description: 'Response for mySessions query including current session identifier' })
export class MySessionsResponse {
  @Field(() => [SessionType])
  sessions: SessionType[];

  @Field({ description: 'Token of the currently active session' })
  currentSessionToken: string;
}
