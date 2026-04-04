import { z } from 'zod';

export const sendVerificationOtpSchema = z.object({
  email: z.string().email('Invalid email address'),
  type: z.enum(['email-verification', 'forget-password', 'sign-in'], {
    required_error: 'OTP type is required',
  }),
});

export const verifyEmailSchema = z.object({
  email: z.string().email('Invalid email address'),
  otp: z.string().length(6, 'OTP must be 6 characters'),
});

export const requestPasswordResetSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
  otp: z.string().length(6, 'OTP must be 6 characters'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

export type SendVerificationOtpInput = z.infer<typeof sendVerificationOtpSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
export type RequestPasswordResetInput = z.infer<typeof requestPasswordResetSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
