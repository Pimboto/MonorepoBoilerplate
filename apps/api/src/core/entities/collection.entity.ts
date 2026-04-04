export class Collection {
  id: string;
  name: string;
  description?: string | null;
  userId: string;
  files?: FileEntity[];
  createdAt: Date;
  updatedAt: Date;
}

// Avoid collision with global File
import type { FileEntity } from './file.entity';
