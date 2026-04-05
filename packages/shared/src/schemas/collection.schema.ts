import { z } from 'zod';

/** Regex that allows alphanumeric, accented chars, and common punctuation. */
export const SAFE_TEXT_REGEX = /^[a-zA-Z0-9\s\u00C0-\u00FF\-_.,!?&'@]*$/;
const INVALID_CHARS_MSG = 'Contains invalid characters or symbols';

export const createCollectionSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(50, 'Name is too long (max 50 chars)')
    .regex(SAFE_TEXT_REGEX, INVALID_CHARS_MSG),
  description: z
    .string()
    .max(100, 'Description is too long (max 100 chars)')
    .regex(SAFE_TEXT_REGEX, INVALID_CHARS_MSG)
    .optional()
    .or(z.literal('')),
});

export const updateCollectionSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(50, 'Name is too long (max 50 chars)')
    .regex(SAFE_TEXT_REGEX, INVALID_CHARS_MSG)
    .optional(),
  description: z
    .string()
    .max(100, 'Description is too long (max 100 chars)')
    .regex(SAFE_TEXT_REGEX, INVALID_CHARS_MSG)
    .nullable()
    .optional(),
});

export type CreateCollectionInput = z.infer<typeof createCollectionSchema>;
export type UpdateCollectionInput = z.infer<typeof updateCollectionSchema>;
