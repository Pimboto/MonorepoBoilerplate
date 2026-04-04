import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z.string().min(1, 'Name cannot be empty').optional(),
  image: z.string().url('Invalid image URL').optional().nullable(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
