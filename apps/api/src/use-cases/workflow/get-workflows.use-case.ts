import { Injectable } from '@nestjs/common';
import type { IDataServices } from '../../core';
import type { WorkflowEntity } from '../../core/entities/workflow.entity';

@Injectable()
export class GetWorkflowsUseCase {
  constructor(private readonly dataServices: IDataServices) {}

  async execute(userId: string): Promise<WorkflowEntity[]> {
    return this.dataServices.workflows.getByUserId(userId);
  }
}
