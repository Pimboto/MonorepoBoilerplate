import { Injectable } from '@nestjs/common';
import type { CreateGenreDto, UpdateGenreDto } from '../../core/dtos';
import { Genre } from '../../core/entities';

@Injectable()
export class GenreFactoryService {
  createNewGenre(createGenreDto: CreateGenreDto) {
    const newGenre = new Genre();
    newGenre.name = createGenreDto.name;

    return newGenre;
  }

  updateGenre(updateGenreDto: UpdateGenreDto) {
    const newGenre = new Genre();
    newGenre.name = updateGenreDto.name;

    return newGenre;
  }
}
