import { GraphQLClient } from 'graphql-request';
import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { ME } from '@/lib/graphql/auth';

const f = createUploadthing();

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
}

interface MeQueryResponse {
  me: AuthenticatedUser;
}

/**
 * Validates the session by forwarding cookies to the NestJS API's
 * protected `me` GraphQL query. If the session is invalid, the API
 * returns an authentication error and we throw Unauthorized.
 */
async function authenticateRequest(cookieHeader: string): Promise<AuthenticatedUser> {
  const client = new GraphQLClient(`${API_URL}/graphql`, {
    headers: { Cookie: cookieHeader },
    credentials: 'include',
  });

  try {
    const data: MeQueryResponse = await client.request(ME);
    return data.me;
  } catch {
    throw new Error('Unauthorized');
  }
}

export const ourFileRouter = {
  collectionFileUploader: f({
    image: { maxFileSize: '4MB', maxFileCount: 10 },
  })
    .middleware(async ({ req }) => {
      const cookieHeader = req.headers.get('cookie') ?? '';
      const user = await authenticateRequest(cookieHeader);
      return { userId: user.id };
    })
    .onUploadComplete(async ({ file }) => {
      return {
        url: file.ufsUrl,
        key: file.key,
        name: file.name,
        size: file.size,
        type: file.type,
      };
    }),

  profileImageUploader: f({
    image: { maxFileSize: '2MB', maxFileCount: 1 },
  })
    .middleware(async ({ req }) => {
      const cookieHeader = req.headers.get('cookie') ?? '';
      const user = await authenticateRequest(cookieHeader);
      return { userId: user.id };
    })
    .onUploadComplete(async ({ file }) => {
      return {
        url: file.ufsUrl,
        key: file.key,
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
