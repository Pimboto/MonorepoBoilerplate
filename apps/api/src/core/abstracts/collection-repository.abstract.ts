import type { Collection } from '../entities/collection.entity';
import { IGenericRepository } from './generic-repository.abstract';

export abstract class ICollectionRepository extends IGenericRepository<Collection> {
  abstract getByUserId(userId: string): Promise<Collection[]>;
  abstract delete(id: string): Promise<Collection>;
}
