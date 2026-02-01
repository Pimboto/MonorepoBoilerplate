import { join } from 'node:path';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { ApolloDriver, type ApolloDriverConfig } from '@nestjs/apollo';
import { Inject, Module, OnModuleInit } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { LoggerModule, LoggerService } from '../logger';

@Module({
  imports: [
    LoggerModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,

      // Code-first approach - generate schema from TypeScript
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,

      // Apollo Server 5 - Modern Landing Page
      // Playground is deprecated and incompatible with Apollo Server 5 in strict mode
      playground: false,
      plugins: [
        ApolloServerPluginLandingPageLocalDefault({
          embed: true, // Embed Sandbox in the page
          includeCookies: true, // Crucial for Better Auth session cookies
        }),
      ],

      // Introspection (needed for Sandbox)
      introspection: true, // In production, consider limiting this or using auth

      // Context - Pass req/res for AuthGuard reading cookies/headers
      context: ({ req, res }) => ({ req, res }),

      // Error formatting
      formatError: (error) => {
        const isDevelopment = process.env.NODE_ENV === 'development';

        return {
          message: error.message,
          code: error.extensions?.code || 'INTERNAL_SERVER_ERROR',
          ...(isDevelopment && {
            locations: error.locations,
            path: error.path,
            extensions: error.extensions,
          }),
        };
      },
    }),
  ],
  providers: [LoggerService],
})
export class GraphQLConfigModule implements OnModuleInit {
  constructor(@Inject(LoggerService) private readonly logger: LoggerService) {
    this.logger.setContext('GraphQLConfigModule');
  }

  onModuleInit(): void {
    this.logger.log('GraphQL module initialized', {
      endpoint: '/graphql',
      sandbox: 'enabled',
      introspection: true,
    });
  }
}
