import { neonConfig, Pool } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaClient } from '@prisma/client';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { emailOTP } from 'better-auth/plugins';
import { Resend } from 'resend';
import ws from 'ws';

// Configure WebSocket for Neon (required for serverless environments)
neonConfig.webSocketConstructor = ws;

// Singleton pattern for Prisma Client with Neon adapter
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

// Lazy initialization function for the pool
function getPool(): Pool {
  if (globalForPrisma.pool) {
    return globalForPrisma.pool;
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  globalForPrisma.pool = new Pool({ connectionString });
  return globalForPrisma.pool;
}

// Lazy initialization function for Prisma client
function getPrismaClient(): PrismaClient {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma;
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  const adapter = new PrismaNeon({ connectionString });

  globalForPrisma.prisma = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
  });

  return globalForPrisma.prisma;
}

// Export getters that lazily initialize — bind methods to preserve `this`
export const pool = new Proxy({} as Pool, {
  get(_, prop) {
    const target = getPool();
    const value = target[prop as keyof Pool];
    // biome-ignore lint/complexity/noBannedTypes: Proxy must bind arbitrary methods from Pool
    return typeof value === 'function' ? (value as Function).bind(target) : value;
  },
});

export const prisma = new Proxy({} as PrismaClient, {
  get(_, prop) {
    const target = getPrismaClient();
    const value = target[prop as keyof PrismaClient];
    // biome-ignore lint/complexity/noBannedTypes: Proxy must bind arbitrary methods from PrismaClient
    return typeof value === 'function' ? (value as Function).bind(target) : value;
  },
});

// Lazy Resend initialization (same pattern as Prisma — env vars aren't available at import time)
let resendInstance: Resend | undefined;
function getResend(): Resend {
  if (!resendInstance) {
    resendInstance = new Resend(process.env.RESEND_API_KEY);
  }
  return resendInstance;
}

// Initialize Better Auth with the lazy prisma client
// Note: We access the proxy directly
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  plugins: [
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        const subjects: Record<string, string> = {
          'email-verification': 'Verify your email - CocoStudio',
          'forget-password': 'Reset your password - CocoStudio',
          'sign-in': 'Sign in to CocoStudio',
        };
        const result = await getResend().emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
          to: email,
          subject: subjects[type] || 'CocoStudio Verification',
          html: `<p>Your verification code is: <strong>${otp}</strong></p><p>This code expires in 10 minutes.</p>`,
        });
        if (result.error) {
          throw new Error(`Resend error: ${result.error.message}`);
        }
      },
      sendVerificationOnSignUp: true,
      otpLength: 6,
      expiresIn: 600,
    }),
  ],
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3001',
  trustedOrigins: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    process.env.BETTER_AUTH_URL || 'http://localhost:3001',
  ],
});

// Re-export PrismaClient and types for convenience
export { PrismaClient };
export type { Prisma } from '@prisma/client';

// Export auth types
export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
