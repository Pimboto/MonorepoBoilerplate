import { Injectable, type OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import type { IDataServices } from '../../../core';
import {
  Author,
  type AuthorDocument,
  Book,
  type BookDocument,
  Genre,
  type GenreDocument,
} from './model';
import { MongoGenericRepository } from './mongo-generic-repository';

@Injectable()
export class MongoDataServices
  implements IDataServices, OnApplicationBootstrap
{
  authors: MongoGenericRepository<Author>;
  books: MongoGenericRepository<Book>;
  genres: MongoGenericRepository<Genre>;

  constructor(
    @InjectModel(Author.name)
    private AuthorRepository: Model<AuthorDocument>,
    @InjectModel(Book.name)
    private BookRepository: Model<BookDocument>,
    @InjectModel(Genre.name)
    private GenreRepository: Model<GenreDocument>,
  ) {}

  onApplicationBootstrap() {
    this.authors = new MongoGenericRepository<Author>(this.AuthorRepository);
    this.books = new MongoGenericRepository<Book>(this.BookRepository, [
      'author',
      'genre',
    ]);
    this.genres = new MongoGenericRepository<Genre>(this.GenreRepository);
  }
}
