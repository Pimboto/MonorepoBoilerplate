import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsEnum, IsString, Length, MinLength } from 'class-validator';

@InputType({ description: 'Send verification OTP input' })
export class SendVerificationOtpInput {
  @Field(() => String)
  @IsEmail({}, { message: 'Invalid email address' })
  email: string;

  @Field(() => String)
  @IsEnum(['email-verification', 'forget-password', 'sign-in'], {
    message: 'Type must be email-verification, forget-password, or sign-in',
  })
  type: string;
}

@InputType({ description: 'Verify email with OTP input' })
export class VerifyEmailInput {
  @Field(() => String)
  @IsEmail({}, { message: 'Invalid email address' })
  email: string;

  @Field(() => String)
  @IsString()
  @Length(6, 6, { message: 'OTP must be 6 characters' })
  otp: string;
}

@InputType({ description: 'Request password reset input' })
export class RequestPasswordResetInput {
  @Field(() => String)
  @IsEmail({}, { message: 'Invalid email address' })
  email: string;
}

@InputType({ description: 'Reset password with OTP input' })
export class ResetPasswordInput {
  @Field(() => String)
  @IsEmail({}, { message: 'Invalid email address' })
  email: string;

  @Field(() => String)
  @IsString()
  @Length(6, 6, { message: 'OTP must be 6 characters' })
  otp: string;

  @Field(() => String)
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  newPassword: string;
}
