import { Injectable } from '@nestjs/common';
import type { IDataServices } from '../../core';
import type { IStorageService } from '../../core/abstracts/storage-service.abstract';
import { ForbiddenError, NotFoundError } from '../../core/errors';

@Injectable()
export class DeleteCollectionUseCase {
  constructor(
    private readonly dataServices: IDataServices,
    private readonly storageService: IStorageService,
  ) {}

  async execute(id: string, userId: string): Promise<boolean> {
    const collection = await this.dataServices.collections.get(id);
    if (!collection) {
      throw new NotFoundError('Collection not found');
    }
    if (collection.userId !== userId) {
      throw new ForbiddenError('You do not have access to this collection');
    }

    // Delete files from UploadThing before Prisma cascade removes the DB records
    const fileKeys = (collection.files || []).map(f => f.key).filter(Boolean);
    if (fileKeys.length > 0) {
      await this.storageService.deleteFiles(fileKeys);
    }

    await this.dataServices.collections.delete(id);
    return true;
  }
}
