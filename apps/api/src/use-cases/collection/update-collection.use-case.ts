import { Injectable } from '@nestjs/common';
import { IDataServices } from '../../core';
import type { Collection } from '../../core/entities/collection.entity';
import { ForbiddenError, NotFoundError } from '../../frameworks/graphql/errors/auth.error';

@Injectable()
export class UpdateCollectionUseCase {
  constructor(private readonly dataServices: IDataServices) {}

  async execute(
    id: string,
    userId: string,
    dto: { name?: string; description?: string | null },
  ): Promise<Collection> {
    const collection = await this.dataServices.collections.get(id);
    if (!collection) {
      throw new NotFoundError('Collection not found');
    }
    if (collection.userId !== userId) {
      throw new ForbiddenError('You do not have access to this collection');
    }
    return this.dataServices.collections.update(id, {
      ...collection,
      ...dto,
    } as Collection);
  }
}
