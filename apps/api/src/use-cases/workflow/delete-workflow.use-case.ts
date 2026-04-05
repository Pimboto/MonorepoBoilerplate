import { Injectable } from '@nestjs/common';
import type { IDataServices } from '../../core';
import { ForbiddenError, NotFoundError } from '../../core/errors';

@Injectable()
export class DeleteWorkflowUseCase {
  constructor(private readonly dataServices: IDataServices) {}

  async execute(id: string, userId: string): Promise<boolean> {
    const workflow = await this.dataServices.workflows.get(id);
    if (!workflow) {
      throw new NotFoundError('Workflow not found');
    }
    if (workflow.userId !== userId) {
      throw new ForbiddenError('You do not have access to this workflow');
    }
    await this.dataServices.workflows.delete(id);
    return true;
  }
}
