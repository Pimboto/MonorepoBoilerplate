import { createFileSchema } from '@cocostudio/shared';
import { Injectable } from '@nestjs/common';
import type { IDataServices } from '../../core';
import type { FileEntity } from '../../core/entities/file.entity';
import { ForbiddenError, NotFoundError, ValidationError } from '../../core/errors';

@Injectable()
export class CreateFileUseCase {
  constructor(private readonly dataServices: IDataServices) {}

  async execute(dto: {
    name: string;
    url: string;
    key: string;
    size: number;
    type: string;
    collectionId: string;
    userId: string;
  }): Promise<FileEntity> {
    const result = createFileSchema.safeParse({
      name: dto.name,
      url: dto.url,
      key: dto.key,
      size: dto.size,
      type: dto.type,
      collectionId: dto.collectionId,
    });
    if (!result.success) {
      const fields: Record<string, string> = {};
      for (const err of result.error.errors) {
        fields[err.path.join('.')] = err.message;
      }
      throw new ValidationError('Invalid input', fields);
    }

    const collection = await this.dataServices.collections.get(dto.collectionId);
    if (!collection) {
      throw new NotFoundError('Collection not found');
    }
    if (collection.userId !== dto.userId) {
      throw new ForbiddenError('You do not have access to this collection');
    }
    return this.dataServices.files.create({
      name: result.data.name,
      url: result.data.url,
      key: result.data.key,
      size: result.data.size,
      type: result.data.type,
      collectionId: result.data.collectionId,
      userId: dto.userId,
    } as FileEntity);
  }
}
