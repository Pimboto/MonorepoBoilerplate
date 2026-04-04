import type { User } from '@cocostudio/database';
import { UseGuards } from '@nestjs/common';
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateCollectionUseCase } from '../../../use-cases/collection/create-collection.use-case';
import { DeleteCollectionUseCase } from '../../../use-cases/collection/delete-collection.use-case';
import { GetCollectionUseCase } from '../../../use-cases/collection/get-collection.use-case';
import { GetCollectionsUseCase } from '../../../use-cases/collection/get-collections.use-case';
import { UpdateCollectionUseCase } from '../../../use-cases/collection/update-collection.use-case';
import { AuthGuard } from '../../auth/auth.guard';
import { CurrentUser } from '../../auth/current-user.decorator';
import { CreateCollectionInput, UpdateCollectionInput } from '../types/collection.input';
import { CollectionType } from '../types/collection.type';

@Resolver(() => CollectionType)
@UseGuards(AuthGuard)
export class CollectionResolver {
  constructor(
    private readonly createCollectionUseCase: CreateCollectionUseCase,
    private readonly deleteCollectionUseCase: DeleteCollectionUseCase,
    private readonly getCollectionUseCase: GetCollectionUseCase,
    private readonly getCollectionsUseCase: GetCollectionsUseCase,
    private readonly updateCollectionUseCase: UpdateCollectionUseCase,
  ) {}

  @Query(() => [CollectionType], { name: 'collections' })
  async getCollections(@CurrentUser() user: User): Promise<CollectionType[]> {
    return this.getCollectionsUseCase.execute(user.id) as unknown as CollectionType[];
  }

  @Query(() => CollectionType, { name: 'collection' })
  async getCollection(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User,
  ): Promise<CollectionType> {
    return this.getCollectionUseCase.execute(id, user.id) as unknown as CollectionType;
  }

  @Mutation(() => CollectionType, { name: 'createCollection' })
  async createCollection(
    @Args('input') input: CreateCollectionInput,
    @CurrentUser() user: User,
  ): Promise<CollectionType> {
    return this.createCollectionUseCase.execute({
      name: input.name,
      description: input.description,
      userId: user.id,
    }) as unknown as CollectionType;
  }

  @Mutation(() => CollectionType, { name: 'updateCollection' })
  async updateCollection(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateCollectionInput,
    @CurrentUser() user: User,
  ): Promise<CollectionType> {
    return this.updateCollectionUseCase.execute(id, user.id, {
      name: input.name,
      description: input.description,
    }) as unknown as CollectionType;
  }

  @Mutation(() => Boolean, { name: 'deleteCollection' })
  async deleteCollection(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User,
  ): Promise<boolean> {
    return this.deleteCollectionUseCase.execute(id, user.id);
  }
}
