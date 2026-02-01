export const DATA_BASE_CONFIGURATION = {
  databaseUrl: process.env.DATABASE_URL as string,
  directDatabaseUrl: process.env.DIRECT_DATABASE_URL as string,
};

export const GRAPHQL_CONFIGURATION = {
  playgroundEnabled: process.env.GRAPHQL_PLAYGROUND_ENABLED === 'true',
  introspectionEnabled: process.env.GRAPHQL_INTROSPECTION_ENABLED === 'true',
};
