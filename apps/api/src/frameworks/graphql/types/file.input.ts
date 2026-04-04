import { Field, InputType, Int } from '@nestjs/graphql';
import { IsUrl, MaxLength, Min, MinLength } from 'class-validator';

@InputType()
export class CreateFileInput {
  @Field()
  @MinLength(1)
  @MaxLength(255)
  name: string;

  @Field()
  @IsUrl()
  url: string;

  @Field()
  @MinLength(1)
  key: string;

  @Field(() => Int)
  @Min(1)
  size: number;

  @Field()
  @MinLength(1)
  type: string;

  @Field()
  @MinLength(1)
  collectionId: string;
}
