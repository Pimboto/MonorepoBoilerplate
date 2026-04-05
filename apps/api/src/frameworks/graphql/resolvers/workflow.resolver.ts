import type { User } from '@cocostudio/database';
import { UseGuards } from '@nestjs/common';
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { DomainError } from '../../../core/errors';
import type { CreateWorkflowUseCase } from '../../../use-cases/workflow/create-workflow.use-case';
import type { DeleteWorkflowUseCase } from '../../../use-cases/workflow/delete-workflow.use-case';
import type { GetWorkflowUseCase } from '../../../use-cases/workflow/get-workflow.use-case';
import type { GetWorkflowsUseCase } from '../../../use-cases/workflow/get-workflows.use-case';
import type { UpdateWorkflowUseCase } from '../../../use-cases/workflow/update-workflow.use-case';
import { AuthGuard } from '../../auth/auth.guard';
import { CurrentUser } from '../../auth/current-user.decorator';
import { InternalServerError, toGraphQLError } from '../errors/auth.error';
import type { CreateWorkflowInput, UpdateWorkflowInput } from '../types/workflow.input';
import { WorkflowType } from '../types/workflow.type';

@Resolver(() => WorkflowType)
@UseGuards(AuthGuard)
export class WorkflowResolver {
  constructor(
    private readonly createWorkflowUseCase: CreateWorkflowUseCase,
    private readonly deleteWorkflowUseCase: DeleteWorkflowUseCase,
    private readonly getWorkflowUseCase: GetWorkflowUseCase,
    private readonly getWorkflowsUseCase: GetWorkflowsUseCase,
    private readonly updateWorkflowUseCase: UpdateWorkflowUseCase,
  ) {}

  @Query(() => [WorkflowType], { name: 'workflows' })
  async getWorkflows(@CurrentUser() user: User): Promise<WorkflowType[]> {
    try {
      return (await this.getWorkflowsUseCase.execute(user.id)) as unknown as WorkflowType[];
    } catch (error) {
      if (error instanceof DomainError) throw toGraphQLError(error);
      throw new InternalServerError('Failed to fetch workflows');
    }
  }

  @Query(() => WorkflowType, { name: 'workflow' })
  async getWorkflow(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User,
  ): Promise<WorkflowType> {
    try {
      return (await this.getWorkflowUseCase.execute(id, user.id)) as unknown as WorkflowType;
    } catch (error) {
      if (error instanceof DomainError) throw toGraphQLError(error);
      throw new InternalServerError('Failed to fetch workflow');
    }
  }

  @Mutation(() => WorkflowType, { name: 'createWorkflow' })
  async createWorkflow(
    @Args('input') input: CreateWorkflowInput,
    @CurrentUser() user: User,
  ): Promise<WorkflowType> {
    try {
      return (await this.createWorkflowUseCase.execute({
        name: input.name,
        description: input.description,
        nodes: input.nodes,
        edges: input.edges,
        userId: user.id,
      })) as unknown as WorkflowType;
    } catch (error) {
      if (error instanceof DomainError) throw toGraphQLError(error);
      throw new InternalServerError('Failed to create workflow');
    }
  }

  @Mutation(() => WorkflowType, { name: 'updateWorkflow' })
  async updateWorkflow(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateWorkflowInput,
    @CurrentUser() user: User,
  ): Promise<WorkflowType> {
    try {
      return (await this.updateWorkflowUseCase.execute(id, user.id, {
        name: input.name,
        description: input.description,
        nodes: input.nodes,
        edges: input.edges,
      })) as unknown as WorkflowType;
    } catch (error) {
      if (error instanceof DomainError) throw toGraphQLError(error);
      throw new InternalServerError('Failed to update workflow');
    }
  }

  @Mutation(() => Boolean, { name: 'deleteWorkflow' })
  async deleteWorkflow(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User,
  ): Promise<boolean> {
    try {
      return await this.deleteWorkflowUseCase.execute(id, user.id);
    } catch (error) {
      if (error instanceof DomainError) throw toGraphQLError(error);
      throw new InternalServerError('Failed to delete workflow');
    }
  }
}
