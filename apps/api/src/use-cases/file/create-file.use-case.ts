import { Injectable } from '@nestjs/common';
import { IDataServices } from '../../core';
import type { FileEntity } from '../../core/entities/file.entity';
import { ForbiddenError, NotFoundError } from '../../frameworks/graphql/errors/auth.error';

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
    const collection = await this.dataServices.collections.get(dto.collectionId);
    if (!collection) {
      throw new NotFoundError('Collection not found');
    }
    if (collection.userId !== dto.userId) {
      throw new ForbiddenError('You do not have access to this collection');
    }
    return this.dataServices.files.create({
      name: dto.name,
      url: dto.url,
      key: dto.key,
      size: dto.size,
      type: dto.type,
      collectionId: dto.collectionId,
      userId: dto.userId,
    } as FileEntity);
  }
}
