import { Module } from '@nestjs/common';
import { AppController, AuthorController, BookController, GenreController } from './controllers';
import { CrmServicesModule } from './services/crm-services/crm-services.module';
import { DataServicesModule } from './services/data-services/data-services.module';
import { AuthorUseCasesModule } from './use-cases/author/author-use-cases.module';
import { BookUseCasesModule } from './use-cases/book/book-use-cases.module';
import { GenreUseCasesModule } from './use-cases/genre/genre-use-cases.module';

@Module({
  imports: [
    DataServicesModule,
    BookUseCasesModule,
    AuthorUseCasesModule,
    GenreUseCasesModule,
    CrmServicesModule,
  ],
  controllers: [AppController, BookController, AuthorController, GenreController],
  providers: [],
})
export class AppModule {}
