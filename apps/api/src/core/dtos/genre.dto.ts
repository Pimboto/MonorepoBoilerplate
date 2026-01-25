import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateGenreDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class UpdateGenreDto extends PartialType(CreateGenreDto) {}
