import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class SessionType {
  @Field(() => ID)
  id: string;

  @Field()
  expiresAt: Date;

  @Field(() => String, { nullable: true })
  ipAddress?: string | null;

  @Field(() => String, { nullable: true })
  userAgent?: string | null;

  @Field()
  userId: string;
}
