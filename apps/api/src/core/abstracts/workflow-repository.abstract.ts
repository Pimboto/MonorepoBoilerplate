import type { WorkflowEntity } from '../entities/workflow.entity';
import { IGenericRepository } from './generic-repository.abstract';

export abstract class IWorkflowRepository extends IGenericRepository<WorkflowEntity> {
  abstract getByUserId(userId: string): Promise<WorkflowEntity[]>;
  abstract delete(id: string): Promise<WorkflowEntity>;
}
