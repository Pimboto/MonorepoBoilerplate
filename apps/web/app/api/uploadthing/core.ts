import { createUploadthing, type FileRouter } from 'uploadthing/next';

const f = createUploadthing();

// Simple auth - you can add better auth later
const auth = () => ({ id: 'user' }); // Replace with real auth

export const ourFileRouter = {
  collectionFileUploader: f({
    image: { maxFileSize: '4MB', maxFileCount: 10 },
  })
    .middleware(async () => {
      const user = auth();
      if (!user) throw new Error('Unauthorized');
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log('Upload complete for userId:', metadata.userId);
      console.log('file url', file.ufsUrl);
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
    .middleware(async () => {
      const user = auth();
      if (!user) throw new Error('Unauthorized');
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
