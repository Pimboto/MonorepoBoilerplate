import { Injectable } from '@nestjs/common';
import { UTApi } from 'uploadthing/server';
import type { IStorageService } from '../../core/abstracts/storage-service.abstract';

@Injectable()
export class UploadThingStorageService implements IStorageService {
  private readonly utapi = new UTApi();

  async deleteFile(key: string): Promise<void> {
    await this.utapi.deleteFiles(key);
  }

  async deleteFiles(keys: string[]): Promise<void> {
    if (keys.length === 0) return;
    await this.utapi.deleteFiles(keys);
  }
}
