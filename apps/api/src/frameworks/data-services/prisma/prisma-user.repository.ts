import { prisma } from '@cocostudio/database';
import type { IUserRepository } from '../../../core';
import type { UserEntity } from '../../../core/entities/user.entity';

export class PrismaUserRepository implements IUserRepository {
  async findById(id: string): Promise<UserEntity | null> {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    return user as UserEntity | null;
  }

  async update(id: string, data: Partial<UserEntity>): Promise<UserEntity> {
    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.image !== undefined && { image: data.image }),
      },
    });
    return updated as unknown as UserEntity;
  }
}
