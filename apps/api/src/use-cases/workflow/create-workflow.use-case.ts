import { createWorkflowSchema } from '@cocostudio/shared';
import { Injectable } from '@nestjs/common';
import type { IDataServices } from '../../core';
import type { WorkflowEntity } from '../../core/entities/workflow.entity';
import { ValidationError } from '../../core/errors';

@Injectable()
export class CreateWorkflowUseCase {
  constructor(private readonly dataServices: IDataServices) {}

  async execute(dto: {
    name: string;
    description?: string;
    nodes?: unknown;
    edges?: unknown;
    userId: string;
  }): Promise<WorkflowEntity> {
    const result = createWorkflowSchema.safeParse({
      name: dto.name,
      description: dto.description,
    });
    if (!result.success) {
      const fields: Record<string, string> = {};
      for (const err of result.error.errors) {
        fields[err.path.join('.')] = err.message;
      }
      throw new ValidationError('Invalid input', fields);
    }

    return this.dataServices.workflows.create({
      name: result.data.name,
      description: result.data.description ?? null,
      nodes: dto.nodes ?? [],
      edges: dto.edges ?? [],
      userId: dto.userId,
    } as WorkflowEntity);
  }
}
