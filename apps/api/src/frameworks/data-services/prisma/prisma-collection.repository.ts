import { prisma } from '@cocostudio/database';
import type { ICollectionRepository } from '../../../core';
import type { Collection } from '../../../core/entities/collection.entity';
import { PrismaGenericRepository } from './prisma-generic-repository';

export class PrismaCollectionRepository
  extends PrismaGenericRepository<Collection>
  implements ICollectionRepository
{
  constructor() {
    super('Collection', prisma.collection, { files: true });
  }

  async getByUserId(userId: string): Promise<Collection[]> {
    return prisma.collection.findMany({
      where: { userId },
      include: { files: true },
      orderBy: { createdAt: 'desc' },
    }) as unknown as Collection[];
  }

  async delete(id: string): Promise<Collection> {
    return prisma.collection.delete({
      where: { id },
      include: { files: true },
    }) as unknown as Collection;
  }
}
