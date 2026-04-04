import { z } from 'zod';

export const createFileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name must be at most 255 characters'),
  url: z.string().url('Invalid URL'),
  key: z.string().min(1, 'Key is required'),
  size: z.number().int().positive('Size must be a positive integer'),
  type: z.string().min(1, 'Type is required'),
  collectionId: z.string().min(1, 'Collection ID is required'),
});

export type CreateFileInput = z.infer<typeof createFileSchema>;
