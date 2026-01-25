import { Module } from '@nestjs/common';
import { DataServicesModule } from '../../services/data-services/data-services.module';
import { AuthorUseCases } from './author.use-case';
import { AuthorFactoryService } from './author-factory.service';

@Module({
  imports: [DataServicesModule],
  providers: [AuthorFactoryService, AuthorUseCases],
  exports: [AuthorFactoryService, AuthorUseCases],
})
export class AuthorUseCasesModule {}
