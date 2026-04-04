import type { ICollectionRepository } from './collection-repository.abstract';
import type { IFileRepository } from './file-repository.abstract';

export abstract class IDataServices {
  abstract collections: ICollectionRepository;
  abstract files: IFileRepository;
}
