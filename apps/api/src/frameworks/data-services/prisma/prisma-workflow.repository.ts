import { prisma } from '@cocostudio/database';
import type { IWorkflowRepository } from '../../../core';
import type { WorkflowEntity } from '../../../core/entities/workflow.entity';
import { PrismaGenericRepository } from './prisma-generic-repository';

export class PrismaWorkflowRepository
  extends PrismaGenericRepository<WorkflowEntity>
  implements IWorkflowRepository
{
  constructor() {
    super('Workflow', prisma.workflow);
  }

  async getByUserId(userId: string): Promise<WorkflowEntity[]> {
    return prisma.workflow.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    }) as unknown as WorkflowEntity[];
  }

  async delete(id: string): Promise<WorkflowEntity> {
    return prisma.workflow.delete({
      where: { id },
    }) as unknown as WorkflowEntity;
  }
}
