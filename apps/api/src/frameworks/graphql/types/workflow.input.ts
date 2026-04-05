import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, MaxLength, MinLength } from 'class-validator';
import GraphQLJSON from 'graphql-type-json';

@InputType()
export class CreateWorkflowInput {
  @Field()
  @MinLength(1)
  @MaxLength(255)
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  @MaxLength(1000)
  description?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  nodes?: unknown;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  edges?: unknown;
}

@InputType()
export class UpdateWorkflowInput {
  @Field({ nullable: true })
  @IsOptional()
  @MinLength(1)
  @MaxLength(255)
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @MaxLength(1000)
  description?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  nodes?: unknown;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  edges?: unknown;
}
