import { createCollectionSchema } from '@cocostudio/shared';
import { Injectable } from '@nestjs/common';
import type { IDataServices } from '../../core';
import type { Collection } from '../../core/entities/collection.entity';
import { ValidationError } from '../../core/errors';

@Injectable()
export class CreateCollectionUseCase {
  constructor(private readonly dataServices: IDataServices) {}

  async execute(dto: { name: string; description?: string; userId: string }): Promise<Collection> {
    const result = createCollectionSchema.safeParse({
      name: dto.name,
      description: dto.description,
    });
    if (!result.success) {
      const fields: Record<string, string> = {};
      for (const err of result.error.errors) {
        fields[err.path.join('.')] = err.message;
      }
      throw new ValidationError('Invalid input', fields);
    }

    return this.dataServices.collections.create({
      name: result.data.name,
      description: result.data.description ?? null,
      userId: dto.userId,
    } as Collection);
  }
}
