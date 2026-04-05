import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './controllers';
import { AuthModule } from './frameworks/auth/auth.module';
import { GraphQLApiModule } from './frameworks/graphql/graphql.module';
import { GqlThrottlerGuard } from './frameworks/graphql/guards/gql-throttler.guard';
import { LoggerModule, LoggerService } from './frameworks/logger';
import { DataServicesModule } from './services/data-services/data-services.module';

@Module({
  imports: [
    LoggerModule,
    ThrottlerModule.forRoot({
      throttlers: [{ ttl: 60000, limit: 100 }],
    }),
    DataServicesModule,
    AuthModule,
    GraphQLApiModule,
  ],
  controllers: [AppController],
  providers: [
    LoggerService,
    {
      provide: APP_GUARD,
      useClass: GqlThrottlerGuard,
    },
  ],
  exports: [LoggerService],
})
export class AppModule {}
