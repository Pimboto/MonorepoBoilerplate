import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { IDataServices } from '../../../core';
import type { Collection } from '../../../core/entities/collection.entity';
import { GetCollectionsUseCase } from '../get-collections.use-case';

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

describe('GetCollectionsUseCase', () => {
  let useCase: GetCollectionsUseCase;
  let mockDataServices: IDataServices;

  beforeEach(() => {
    mockDataServices = createMockDataServices();
    useCase = new GetCollectionsUseCase(mockDataServices);
  });

  it('should return all collections for the given user', async () => {
    const collections: Collection[] = [
      {
        id: 'col-1',
        name: 'First',
        description: null,
        userId: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'col-2',
        name: 'Second',
        description: 'desc',
        userId: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    vi.mocked(mockDataServices.collections.getByUserId).mockResolvedValue(collections);

    const result = await useCase.execute('user-1');

    expect(result).toEqual(collections);
    expect(mockDataServices.collections.getByUserId).toHaveBeenCalledWith('user-1');
  });

  it('should return an empty array when user has no collections', async () => {
    vi.mocked(mockDataServices.collections.getByUserId).mockResolvedValue([]);

    const result = await useCase.execute('user-no-collections');

    expect(result).toEqual([]);
    expect(mockDataServices.collections.getByUserId).toHaveBeenCalledWith('user-no-collections');
  });
});
