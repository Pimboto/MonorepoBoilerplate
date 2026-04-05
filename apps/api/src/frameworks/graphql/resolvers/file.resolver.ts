import type { User } from '@cocostudio/database';
import { UseGuards } from '@nestjs/common';
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { DomainError } from '../../../core/errors';
import type { CreateFileUseCase } from '../../../use-cases/file/create-file.use-case';
import type { DeleteFileUseCase } from '../../../use-cases/file/delete-file.use-case';
import type { GetFilesByCollectionUseCase } from '../../../use-cases/file/get-files-by-collection.use-case';
import { AuthGuard } from '../../auth/auth.guard';
import { CurrentUser } from '../../auth/current-user.decorator';
import { InternalServerError, toGraphQLError } from '../errors/auth.error';
import type { CreateFileInput } from '../types/file.input';
import { FileType } from '../types/file.type';

@Resolver(() => FileType)
@UseGuards(AuthGuard)
export class FileResolver {
  constructor(
    private readonly createFileUseCase: CreateFileUseCase,
    private readonly deleteFileUseCase: DeleteFileUseCase,
    private readonly getFilesByCollectionUseCase: GetFilesByCollectionUseCase,
  ) {}

  @Query(() => [FileType], { name: 'filesByCollection' })
  async getFilesByCollection(
    @Args('collectionId', { type: () => ID }) collectionId: string,
    @CurrentUser() user: User,
  ): Promise<FileType[]> {
    try {
      return (await this.getFilesByCollectionUseCase.execute(
        collectionId,
        user.id,
      )) as unknown as FileType[];
    } catch (error) {
      if (error instanceof DomainError) throw toGraphQLError(error);
      throw new InternalServerError('Failed to fetch files');
    }
  }

  @Mutation(() => FileType, { name: 'createFile' })
  async createFile(
    @Args('input') input: CreateFileInput,
    @CurrentUser() user: User,
  ): Promise<FileType> {
    try {
      return (await this.createFileUseCase.execute({
        name: input.name,
        url: input.url,
        key: input.key,
        size: input.size,
        type: input.type,
        collectionId: input.collectionId,
        userId: user.id,
      })) as unknown as FileType;
    } catch (error) {
      if (error instanceof DomainError) throw toGraphQLError(error);
      throw new InternalServerError('Failed to create file');
    }
  }

  @Mutation(() => Boolean, { name: 'deleteFile' })
  async deleteFile(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User,
  ): Promise<boolean> {
    try {
      return await this.deleteFileUseCase.execute(id, user.id);
    } catch (error) {
      if (error instanceof DomainError) throw toGraphQLError(error);
      throw new InternalServerError('Failed to delete file');
    }
  }
}
