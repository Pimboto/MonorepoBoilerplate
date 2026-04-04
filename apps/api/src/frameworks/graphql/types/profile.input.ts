import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, IsUrl, MinLength } from 'class-validator';

@InputType()
export class UpdateProfileInput {
  @Field({ nullable: true })
  @IsOptional()
  @MinLength(1, { message: 'Name cannot be empty' })
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUrl({}, { message: 'Invalid image URL' })
  image?: string;
}

@InputType()
export class ChangePasswordInput {
  @Field()
  currentPassword: string;

  @Field()
  @MinLength(8, { message: 'New password must be at least 8 characters' })
  newPassword: string;
}
