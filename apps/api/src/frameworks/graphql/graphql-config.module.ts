import { join } from 'node:path';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { ApolloDriver, type ApolloDriverConfig } from '@nestjs/apollo';
import { Inject, Module, type OnModuleInit } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import type { Request, Response } from 'express';
import { LoggerModule, LoggerService } from '../logger';
import { createDepthLimitRule } from './validation/depth-limit.rule';

/** Maximum allowed query nesting depth (Collection -> Files is ~2 levels). */
const MAX_QUERY_DEPTH = 5;

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

      // Introspection — disabled in production to prevent schema discovery
      introspection: process.env.NODE_ENV !== 'production',

      // Depth limiting — prevent deeply nested queries (DoS protection)
      validationRules: [createDepthLimitRule(MAX_QUERY_DEPTH)],

      // Context - Pass req/res for AuthGuard reading cookies/headers
      context: ({ req, res }: { req: Request; res: Response }) => ({ req, res }),

      // Error formatting — spec-compliant (code inside extensions)
      formatError: error => {
        const isDevelopment = process.env.NODE_ENV === 'development';

        return {
          message: error.message,
          locations: error.locations,
          path: error.path,
          extensions: {
            code: error.extensions?.code || 'INTERNAL_SERVER_ERROR',
            ...(isDevelopment && error.extensions ? { ...error.extensions } : {}),
          },
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
    const introspectionEnabled = process.env.NODE_ENV !== 'production';
    this.logger.log('GraphQL module initialized', {
      endpoint: '/graphql',
      sandbox: 'enabled',
      introspection: introspectionEnabled,
      maxQueryDepth: MAX_QUERY_DEPTH,
    });
  }
}
