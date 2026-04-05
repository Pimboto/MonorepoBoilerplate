/** @type {import('next').NextConfig} */
const nextConfig = {
  // Read .env from monorepo root
  env: {
    UPLOADTHING_TOKEN: process.env.UPLOADTHING_TOKEN,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "utfs.io",
      },
      {
        protocol: "https",
        hostname: "*.ufs.sh",
      },
    ],
  },
};

module.exports = nextConfig;
