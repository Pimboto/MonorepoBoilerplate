import { Module } from '@nestjs/common';
import { AppController } from './controllers';
import { AuthModule } from './frameworks/auth/auth.module';
import { GraphQLApiModule } from './frameworks/graphql/graphql.module';
import { DataServicesModule } from './services/data-services/data-services.module';

@Module({
  imports: [DataServicesModule, AuthModule, GraphQLApiModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
