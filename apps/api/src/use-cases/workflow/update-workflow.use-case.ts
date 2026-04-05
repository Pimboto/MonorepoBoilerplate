import { updateWorkflowSchema } from '@cocostudio/shared';
import { Injectable } from '@nestjs/common';
import type { IDataServices } from '../../core';
import type { WorkflowEntity } from '../../core/entities/workflow.entity';
import { ForbiddenError, NotFoundError, ValidationError } from '../../core/errors';

@Injectable()
export class UpdateWorkflowUseCase {
  constructor(private readonly dataServices: IDataServices) {}

  async execute(
    id: string,
    userId: string,
    dto: { name?: string; description?: string | null; nodes?: unknown; edges?: unknown },
  ): Promise<WorkflowEntity> {
    const result = updateWorkflowSchema.safeParse(dto);
    if (!result.success) {
      const fields: Record<string, string> = {};
      for (const err of result.error.errors) {
        fields[err.path.join('.')] = err.message;
      }
      throw new ValidationError('Invalid input', fields);
    }

    const workflow = await this.dataServices.workflows.get(id);
    if (!workflow) {
      throw new NotFoundError('Workflow not found');
    }
    if (workflow.userId !== userId) {
      throw new ForbiddenError('You do not have access to this workflow');
    }
    return this.dataServices.workflows.update(id, {
      ...workflow,
      ...result.data,
    } as WorkflowEntity);
  }
}
