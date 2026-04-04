import { Injectable } from '@nestjs/common';
import { IDataServices } from '../../core';
import type { Collection } from '../../core/entities/collection.entity';

@Injectable()
export class GetCollectionsUseCase {
  constructor(private readonly dataServices: IDataServices) {}

  async execute(userId: string): Promise<Collection[]> {
    return this.dataServices.collections.getByUserId(userId);
  }
}
