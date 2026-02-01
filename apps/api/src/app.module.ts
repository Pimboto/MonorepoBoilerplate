import { Module } from '@nestjs/common';
import { AppController } from './controllers';
import { AuthModule } from './frameworks/auth/auth.module';
import { GraphQLApiModule } from './frameworks/graphql/graphql.module';
import { LoggerModule, LoggerService } from './frameworks/logger';
import { DataServicesModule } from './services/data-services/data-services.module';

@Module({
  imports: [LoggerModule, DataServicesModule, AuthModule, GraphQLApiModule],
  controllers: [AppController],
  providers: [LoggerService],
  exports: [LoggerService],
})
export class AppModule {}
