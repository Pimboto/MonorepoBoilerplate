import { prisma } from '@cocostudio/database';
import type { IFileRepository } from '../../../core';
import type { FileEntity } from '../../../core/entities/file.entity';
import { PrismaGenericRepository } from './prisma-generic-repository';

export class PrismaFileRepository
  extends PrismaGenericRepository<FileEntity>
  implements IFileRepository
{
  constructor() {
    super('File', prisma.file);
  }

  async getByCollectionId(collectionId: string): Promise<FileEntity[]> {
    return prisma.file.findMany({
      where: { collectionId },
      orderBy: { createdAt: 'desc' },
    }) as unknown as FileEntity[];
  }

  async getByUserId(userId: string): Promise<FileEntity[]> {
    return prisma.file.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    }) as unknown as FileEntity[];
  }

  async delete(id: string): Promise<FileEntity> {
    return prisma.file.delete({
      where: { id },
    }) as unknown as FileEntity;
  }
}
