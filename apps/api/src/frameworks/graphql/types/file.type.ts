import { Field, ID, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class FileType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  url: string;

  @Field()
  key: string;

  @Field(() => Int)
  size: number;

  @Field()
  type: string;

  @Field()
  collectionId: string;

  @Field()
  userId: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
