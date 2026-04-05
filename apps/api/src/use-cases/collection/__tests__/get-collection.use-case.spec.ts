import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { IDataServices } from '../../../core';
import type { Collection } from '../../../core/entities/collection.entity';
import { ForbiddenError, NotFoundError } from '../../../core/errors';
import { GetCollectionUseCase } from '../get-collection.use-case';

function createMockDataServices(): IDataServices {
  return {
    collections: {
      getAll: vi.fn(),
      get: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      getByUserId: vi.fn(),
      delete: vi.fn(),
    },
    files: {
      getAll: vi.fn(),
      get: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      getByCollectionId: vi.fn(),
      getByUserId: vi.fn(),
      delete: vi.fn(),
    },
    users: {
      findById: vi.fn(),
      update: vi.fn(),
    },
  } as unknown as IDataServices;
}

describe('GetCollectionUseCase', () => {
  let useCase: GetCollectionUseCase;
  let mockDataServices: IDataServices;

  beforeEach(() => {
    mockDataServices = createMockDataServices();
    useCase = new GetCollectionUseCase(mockDataServices);
  });

  it('should return the collection when found and owned by the user', async () => {
    const collection: Collection = {
      id: 'col-1',
      name: 'My Collection',
      description: 'desc',
      userId: 'user-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(mockDataServices.collections.get).mockResolvedValue(collection);

    const result = await useCase.execute('col-1', 'user-1');

    expect(result).toEqual(collection);
    expect(mockDataServices.collections.get).toHaveBeenCalledWith('col-1');
  });

  it('should throw NotFoundError when collection does not exist', async () => {
    vi.mocked(mockDataServices.collections.get).mockResolvedValue(null as unknown as Collection);

    await expect(useCase.execute('nonexistent', 'user-1')).rejects.toThrow(NotFoundError);
    await expect(useCase.execute('nonexistent', 'user-1')).rejects.toThrow('Collection not found');
  });

  it('should throw ForbiddenError when user does not own the collection', async () => {
    const collection: Collection = {
      id: 'col-1',
      name: 'Not Mine',
      description: null,
      userId: 'other-user',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(mockDataServices.collections.get).mockResolvedValue(collection);

    await expect(useCase.execute('col-1', 'user-1')).rejects.toThrow(ForbiddenError);
    await expect(useCase.execute('col-1', 'user-1')).rejects.toThrow(
      'You do not have access to this collection',
    );
  });
});
