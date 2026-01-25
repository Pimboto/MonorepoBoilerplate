import { Module } from '@nestjs/common';
import { DataServicesModule } from '../../services/data-services/data-services.module';
import { GenreUseCases } from './genre.use-case';
import { GenreFactoryService } from './genre-factory.service';

@Module({
  imports: [DataServicesModule],
  providers: [GenreFactoryService, GenreUseCases],
  exports: [GenreFactoryService, GenreUseCases],
})
export class GenreUseCasesModule {}
