import { Injectable } from '@nestjs/common';
import type { IDataServices } from '../../core';
import type { Collection } from '../../core/entities/collection.entity';
import { ForbiddenError, NotFoundError } from '../../core/errors';

@Injectable()
export class GetCollectionUseCase {
  constructor(private readonly dataServices: IDataServices) {}

  async execute(id: string, userId: string): Promise<Collection> {
    const collection = await this.dataServices.collections.get(id);
    if (!collection) {
      throw new NotFoundError('Collection not found');
    }
    if (collection.userId !== userId) {
      throw new ForbiddenError('You do not have access to this collection');
    }
    return collection;
  }
}
