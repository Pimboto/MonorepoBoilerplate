import { Field, ID, ObjectType } from '@nestjs/graphql';
import { FileType } from './file.type';

@ObjectType()
export class CollectionType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  userId: string;

  @Field(() => [FileType], { nullable: true })
  files?: FileType[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
