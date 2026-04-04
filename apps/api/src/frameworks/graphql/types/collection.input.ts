import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, MaxLength, MinLength } from 'class-validator';

@InputType()
export class CreateCollectionInput {
  @Field()
  @MinLength(1)
  @MaxLength(255)
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  @MaxLength(1000)
  description?: string;
}

@InputType()
export class UpdateCollectionInput {
  @Field({ nullable: true })
  @IsOptional()
  @MinLength(1)
  @MaxLength(255)
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @MaxLength(1000)
  description?: string;
}
