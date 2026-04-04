import { createRouteHandler } from 'uploadthing/next';
import { ourFileRouter } from './core';

// UploadThing automatically reads UPLOADTHING_TOKEN from env
export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
});
