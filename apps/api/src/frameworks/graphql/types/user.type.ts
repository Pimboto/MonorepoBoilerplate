import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class UserType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  email: string;

  @Field()
  emailVerified: boolean;

  @Field(() => String, { nullable: true })
  image?: string | null;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
