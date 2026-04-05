import { Injectable } from '@nestjs/common';
import type { IDataServices } from '../../core';
import type { FileEntity } from '../../core/entities/file.entity';
import { ForbiddenError, NotFoundError } from '../../core/errors';

@Injectable()
export class GetFilesByCollectionUseCase {
  constructor(private readonly dataServices: IDataServices) {}

  async execute(collectionId: string, userId: string): Promise<FileEntity[]> {
    const collection = await this.dataServices.collections.get(collectionId);
    if (!collection) {
      throw new NotFoundError('Collection not found');
    }
    if (collection.userId !== userId) {
      throw new ForbiddenError('You do not have access to this collection');
    }
    return this.dataServices.files.getByCollectionId(collectionId);
  }
}
