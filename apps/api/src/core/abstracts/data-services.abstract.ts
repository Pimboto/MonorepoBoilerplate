import type { Author, Book, Genre } from '../entities';
import type { IGenericRepository } from './generic-repository.abstract';

export abstract class IDataServices {
  abstract authors: IGenericRepository<Author>;

  abstract books: IGenericRepository<Book>;

  abstract genres: IGenericRepository<Genre>;
}
