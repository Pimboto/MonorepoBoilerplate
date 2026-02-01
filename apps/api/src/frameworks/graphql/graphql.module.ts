import { Module } from '@nestjs/common';
import { LoggerService } from '../logger';
import { GraphQLConfigModule } from './graphql-config.module';
import { AuthResolver } from './resolvers/auth.resolver';
import { UserResolver } from './resolvers/user.resolver';

@Module({
  imports: [GraphQLConfigModule],
  providers: [UserResolver, AuthResolver, LoggerService],
})
export class GraphQLApiModule {}
