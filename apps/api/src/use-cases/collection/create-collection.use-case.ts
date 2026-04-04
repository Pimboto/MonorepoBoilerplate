import { Injectable } from '@nestjs/common';
import { IDataServices } from '../../core';
import type { Collection } from '../../core/entities/collection.entity';

@Injectable()
export class CreateCollectionUseCase {
  constructor(private readonly dataServices: IDataServices) {}

  async execute(dto: { name: string; description?: string; userId: string }): Promise<Collection> {
    return this.dataServices.collections.create({
      name: dto.name,
      description: dto.description ?? null,
      userId: dto.userId,
    } as Collection);
  }
}
