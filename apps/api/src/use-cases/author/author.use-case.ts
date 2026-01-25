import { Injectable } from '@nestjs/common';
import type { IDataServices } from '../../core/abstracts';
import type { CreateAuthorDto, UpdateAuthorDto } from '../../core/dtos';
import type { Author } from '../../core/entities';
import type { AuthorFactoryService } from './author-factory.service';

@Injectable()
export class AuthorUseCases {
  constructor(
    private dataServices: IDataServices,
    private authorFactoryService: AuthorFactoryService,
  ) {}

  getAllAuthors(): Promise<Author[]> {
    return this.dataServices.authors.getAll();
  }

  getAuthorById(id: any): Promise<Author> {
    return this.dataServices.authors.get(id);
  }

  createAuthor(createAuthorDto: CreateAuthorDto): Promise<Author> {
    const author = this.authorFactoryService.createNewAuthor(createAuthorDto);
    return this.dataServices.authors.create(author);
  }

  updateAuthor(authorId: string, updateAuthorDto: UpdateAuthorDto): Promise<Author> {
    const author = this.authorFactoryService.updateAuthor(updateAuthorDto);
    return this.dataServices.authors.update(authorId, author);
  }
}
