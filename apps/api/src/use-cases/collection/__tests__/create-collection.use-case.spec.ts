import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { IDataServices } from '../../../core';
import type { Collection } from '../../../core/entities/collection.entity';
import { CreateCollectionUseCase } from '../create-collection.use-case';

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

describe('CreateCollectionUseCase', () => {
  let useCase: CreateCollectionUseCase;
  let mockDataServices: IDataServices;

  beforeEach(() => {
    mockDataServices = createMockDataServices();
    useCase = new CreateCollectionUseCase(mockDataServices);
  });

  it('should create a collection with valid input', async () => {
    const createdCollection: Collection = {
      id: 'col-1',
      name: 'My Collection',
      description: 'A test collection',
      userId: 'user-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(mockDataServices.collections.create).mockResolvedValue(createdCollection);

    const result = await useCase.execute({
      name: 'My Collection',
      description: 'A test collection',
      userId: 'user-1',
    });

    expect(result).toEqual(createdCollection);
    expect(mockDataServices.collections.create).toHaveBeenCalledWith({
      name: 'My Collection',
      description: 'A test collection',
      userId: 'user-1',
    });
  });

  it('should default description to null when not provided', async () => {
    const createdCollection: Collection = {
      id: 'col-2',
      name: 'No Desc',
      description: null,
      userId: 'user-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(mockDataServices.collections.create).mockResolvedValue(createdCollection);

    await useCase.execute({
      name: 'No Desc',
      userId: 'user-1',
    });

    expect(mockDataServices.collections.create).toHaveBeenCalledWith({
      name: 'No Desc',
      description: null,
      userId: 'user-1',
    });
  });

  it('should pass the userId from the dto', async () => {
    const createdCollection: Collection = {
      id: 'col-3',
      name: 'Test',
      description: null,
      userId: 'specific-user-id',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(mockDataServices.collections.create).mockResolvedValue(createdCollection);

    await useCase.execute({
      name: 'Test',
      userId: 'specific-user-id',
    });

    expect(mockDataServices.collections.create).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'specific-user-id' }),
    );
  });
});
