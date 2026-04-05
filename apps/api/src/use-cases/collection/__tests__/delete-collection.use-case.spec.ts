import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { IDataServices } from '../../../core';
import type { IStorageService } from '../../../core/abstracts/storage-service.abstract';
import type { Collection } from '../../../core/entities/collection.entity';
import { ForbiddenError, NotFoundError } from '../../../core/errors';
import { DeleteCollectionUseCase } from '../delete-collection.use-case';

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

function createMockStorageService(): IStorageService {
  return {
    deleteFile: vi.fn(),
    deleteFiles: vi.fn(),
  } as unknown as IStorageService;
}

describe('DeleteCollectionUseCase', () => {
  let useCase: DeleteCollectionUseCase;
  let mockDataServices: IDataServices;
  let mockStorageService: IStorageService;

  beforeEach(() => {
    mockDataServices = createMockDataServices();
    mockStorageService = createMockStorageService();
    useCase = new DeleteCollectionUseCase(mockDataServices, mockStorageService);
  });

  it('should delete the collection and associated storage files', async () => {
    const collection: Collection = {
      id: 'col-1',
      name: 'To Delete',
      description: null,
      userId: 'user-1',
      files: [
        {
          id: 'f1',
          name: 'file1.pdf',
          url: 'https://example.com/file1.pdf',
          key: 'key-1',
          size: 1000,
          type: 'application/pdf',
          collectionId: 'col-1',
          userId: 'user-1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'f2',
          name: 'file2.png',
          url: 'https://example.com/file2.png',
          key: 'key-2',
          size: 2000,
          type: 'image/png',
          collectionId: 'col-1',
          userId: 'user-1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(mockDataServices.collections.get).mockResolvedValue(collection);
    vi.mocked(mockStorageService.deleteFiles).mockResolvedValue(undefined);
    vi.mocked(mockDataServices.collections.delete).mockResolvedValue(collection);

    const result = await useCase.execute('col-1', 'user-1');

    expect(result).toBe(true);
    expect(mockStorageService.deleteFiles).toHaveBeenCalledWith(['key-1', 'key-2']);
    expect(mockDataServices.collections.delete).toHaveBeenCalledWith('col-1');
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

  it('should handle collection with empty files array', async () => {
    const collection: Collection = {
      id: 'col-1',
      name: 'Empty',
      description: null,
      userId: 'user-1',
      files: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(mockDataServices.collections.get).mockResolvedValue(collection);
    vi.mocked(mockDataServices.collections.delete).mockResolvedValue(collection);

    const result = await useCase.execute('col-1', 'user-1');

    expect(result).toBe(true);
    expect(mockStorageService.deleteFiles).not.toHaveBeenCalled();
    expect(mockDataServices.collections.delete).toHaveBeenCalledWith('col-1');
  });

  it('should handle collection with no files property', async () => {
    const collection: Collection = {
      id: 'col-1',
      name: 'No Files',
      description: null,
      userId: 'user-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(mockDataServices.collections.get).mockResolvedValue(collection);
    vi.mocked(mockDataServices.collections.delete).mockResolvedValue(collection);

    const result = await useCase.execute('col-1', 'user-1');

    expect(result).toBe(true);
    expect(mockStorageService.deleteFiles).not.toHaveBeenCalled();
    expect(mockDataServices.collections.delete).toHaveBeenCalledWith('col-1');
  });
});
