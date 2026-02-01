import type { PrismaClient } from '@cocostudio/database';
import { pool, prisma } from '@cocostudio/database';
import { Injectable, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  // Use the singleton instance from @cocostudio/database
  private client = prisma;

  async onModuleInit() {
    await this.client.$connect();
  }

  async onModuleDestroy() {
    await this.client.$disconnect();
    await pool.end();
  }

  // Helper for transactions
  async executeTransaction<T>(fn: (prisma: PrismaClient) => Promise<T>): Promise<T> {
    return this.client.$transaction(fn);
  }
}
