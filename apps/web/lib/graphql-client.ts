import { GraphQLClient } from 'graphql-request';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const graphqlClient = new GraphQLClient(`${API_URL}/graphql`, {
  credentials: 'include',
});
