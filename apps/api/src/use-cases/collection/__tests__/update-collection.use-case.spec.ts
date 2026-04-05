import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { IDataServices } from '../../../core';
import type { Collection } from '../../../core/entities/collection.entity';
import { ForbiddenError, NotFoundError } from '../../../core/errors';
import { UpdateCollectionUseCase } from '../update-collection.use-case';

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

describe('UpdateCollectionUseCase', () => {
  let useCase: UpdateCollectionUseCase;
  let mockDataServices: IDataServices;

  beforeEach(() => {
    mockDataServices = createMockDataServices();
    useCase = new UpdateCollectionUseCase(mockDataServices);
  });

  it('should update the collection name', async () => {
    const existing: Collection = {
      id: 'col-1',
      name: 'Old Name',
      description: 'desc',
      userId: 'user-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const updated: Collection = {
      ...existing,
      name: 'New Name',
    };

    vi.mocked(mockDataServices.collections.get).mockResolvedValue(existing);
    vi.mocked(mockDataServices.collections.update).mockResolvedValue(updated);

    const result = await useCase.execute('col-1', 'user-1', { name: 'New Name' });

    expect(result).toEqual(updated);
    expect(mockDataServices.collections.update).toHaveBeenCalledWith(
      'col-1',
      expect.objectContaining({ name: 'New Name' }),
    );
  });

  it('should update the collection description', async () => {
    const existing: Collection = {
      id: 'col-1',
      name: 'Name',
      description: 'Old desc',
      userId: 'user-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const updated: Collection = {
      ...existing,
      description: 'New desc',
    };

    vi.mocked(mockDataServices.collections.get).mockResolvedValue(existing);
    vi.mocked(mockDataServices.collections.update).mockResolvedValue(updated);

    const result = await useCase.execute('col-1', 'user-1', { description: 'New desc' });

    expect(result).toEqual(updated);
    expect(mockDataServices.collections.update).toHaveBeenCalledWith(
      'col-1',
      expect.objectContaining({ description: 'New desc' }),
    );
  });

  it('should throw NotFoundError when collection does not exist', async () => {
    vi.mocked(mockDataServices.collections.get).mockResolvedValue(null as unknown as Collection);

    await expect(useCase.execute('nonexistent', 'user-1', { name: 'X' })).rejects.toThrow(
      NotFoundError,
    );
  });

  it('should throw ForbiddenError when user does not own the collection', async () => {
    const existing: Collection = {
      id: 'col-1',
      name: 'Name',
      description: null,
      userId: 'other-user',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(mockDataServices.collections.get).mockResolvedValue(existing);

    await expect(useCase.execute('col-1', 'user-1', { name: 'X' })).rejects.toThrow(ForbiddenError);
  });

  it('should merge the dto onto the existing collection for the update call', async () => {
    const existing: Collection = {
      id: 'col-1',
      name: 'Original',
      description: 'Original desc',
      userId: 'user-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(mockDataServices.collections.get).mockResolvedValue(existing);
    vi.mocked(mockDataServices.collections.update).mockResolvedValue(existing);

    await useCase.execute('col-1', 'user-1', { name: 'Updated' });

    const updateArg = vi.mocked(mockDataServices.collections.update).mock.calls[0][1];
    expect(updateArg).toMatchObject({
      name: 'Updated',
      description: 'Original desc',
      userId: 'user-1',
    });
  });
});
