import { updateCollectionSchema } from '@cocostudio/shared';
import { Injectable } from '@nestjs/common';
import type { IDataServices } from '../../core';
import type { Collection } from '../../core/entities/collection.entity';
import { ForbiddenError, NotFoundError, ValidationError } from '../../core/errors';

@Injectable()
export class UpdateCollectionUseCase {
  constructor(private readonly dataServices: IDataServices) {}

  async execute(
    id: string,
    userId: string,
    dto: { name?: string; description?: string | null },
  ): Promise<Collection> {
    const result = updateCollectionSchema.safeParse(dto);
    if (!result.success) {
      const fields: Record<string, string> = {};
      for (const err of result.error.errors) {
        fields[err.path.join('.')] = err.message;
      }
      throw new ValidationError('Invalid input', fields);
    }

    const collection = await this.dataServices.collections.get(id);
    if (!collection) {
      throw new NotFoundError('Collection not found');
    }
    if (collection.userId !== userId) {
      throw new ForbiddenError('You do not have access to this collection');
    }
    return this.dataServices.collections.update(id, {
      ...collection,
      ...result.data,
    } as Collection);
  }
}
