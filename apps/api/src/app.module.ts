import { Module } from '@nestjs/common';
import { AppController } from './controllers';
import { DataServicesModule } from './services/data-services/data-services.module';
import { AuthModule } from './frameworks/auth/auth.module';
import { GraphQLApiModule } from './frameworks/graphql/graphql.module';

@Module({
  imports: [DataServicesModule, AuthModule, GraphQLApiModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
