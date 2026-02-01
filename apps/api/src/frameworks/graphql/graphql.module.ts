import { Module } from '@nestjs/common';
import { GraphQLConfigModule } from './graphql-config.module';
import { UserResolver } from './resolvers/user.resolver';

@Module({
  imports: [GraphQLConfigModule],
  providers: [UserResolver],
})
export class GraphQLApiModule {}
