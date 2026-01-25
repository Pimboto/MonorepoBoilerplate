import { Module } from '@nestjs/common';
import { CrmServicesModule } from '../../services/crm-services/crm-services.module';
import { DataServicesModule } from '../../services/data-services/data-services.module';
import { BookUseCases } from './book.use-case';
import { BookFactoryService } from './book-factory.service';

@Module({
  imports: [DataServicesModule, CrmServicesModule],
  providers: [BookFactoryService, BookUseCases],
  exports: [BookFactoryService, BookUseCases],
})
export class BookUseCasesModule {}
