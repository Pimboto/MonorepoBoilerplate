import type { FileEntity } from '../entities/file.entity';
import { IGenericRepository } from './generic-repository.abstract';

export abstract class IFileRepository extends IGenericRepository<FileEntity> {
  abstract getByCollectionId(collectionId: string): Promise<FileEntity[]>;
  abstract getByUserId(userId: string): Promise<FileEntity[]>;
  abstract delete(id: string): Promise<FileEntity>;
}
