import { Injectable } from '@nestjs/common';
import type { IDataServices } from '../../core';
import type { IStorageService } from '../../core/abstracts/storage-service.abstract';
import { ForbiddenError, NotFoundError } from '../../core/errors';

@Injectable()
export class DeleteFileUseCase {
  constructor(
    private readonly dataServices: IDataServices,
    private readonly storageService: IStorageService,
  ) {}

  async execute(id: string, userId: string): Promise<boolean> {
    const file = await this.dataServices.files.get(id);
    if (!file) {
      throw new NotFoundError('File not found');
    }
    if (file.userId !== userId) {
      throw new ForbiddenError('You do not have access to this file');
    }
    await this.storageService.deleteFile(file.key);
    await this.dataServices.files.delete(id);
    return true;
  }
}
