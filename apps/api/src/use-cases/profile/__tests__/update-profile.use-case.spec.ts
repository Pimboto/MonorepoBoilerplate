import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { IDataServices } from '../../../core';
import type { IStorageService } from '../../../core/abstracts/storage-service.abstract';
import type { UserEntity } from '../../../core/entities/user.entity';
import { UpdateProfileUseCase } from '../update-profile.use-case';

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

describe('UpdateProfileUseCase', () => {
  let useCase: UpdateProfileUseCase;
  let mockDataServices: IDataServices;
  let mockStorageService: IStorageService;

  const baseUser: UserEntity = {
    id: 'user-1',
    name: 'John Doe',
    email: 'john@example.com',
    emailVerified: true,
    image: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    mockDataServices = createMockDataServices();
    mockStorageService = createMockStorageService();
    useCase = new UpdateProfileUseCase(mockDataServices, mockStorageService);
  });

  it('should update the user name', async () => {
    const updatedUser = { ...baseUser, name: 'Jane Doe' };
    vi.mocked(mockDataServices.users.update).mockResolvedValue(updatedUser);

    const result = await useCase.execute('user-1', { name: 'Jane Doe' });

    expect(result).toEqual(updatedUser);
    expect(mockDataServices.users.update).toHaveBeenCalledWith('user-1', { name: 'Jane Doe' });
  });

  it('should delete the old image when updating with a new image', async () => {
    const userWithImage: UserEntity = {
      ...baseUser,
      image: 'https://storage.example.com/old-key-123',
    };
    const updatedUser = { ...baseUser, image: 'https://storage.example.com/new-key-456' };

    vi.mocked(mockDataServices.users.findById).mockResolvedValue(userWithImage);
    vi.mocked(mockStorageService.deleteFile).mockResolvedValue(undefined);
    vi.mocked(mockDataServices.users.update).mockResolvedValue(updatedUser);

    const result = await useCase.execute('user-1', {
      image: 'https://storage.example.com/new-key-456',
    });

    expect(result).toEqual(updatedUser);
    expect(mockDataServices.users.findById).toHaveBeenCalledWith('user-1');
    expect(mockStorageService.deleteFile).toHaveBeenCalledWith('old-key-123');
    expect(mockDataServices.users.update).toHaveBeenCalledWith('user-1', {
      image: 'https://storage.example.com/new-key-456',
    });
  });

  it('should not attempt to delete old image when user has no existing image', async () => {
    const userNoImage: UserEntity = { ...baseUser, image: null };
    const updatedUser = { ...baseUser, image: 'https://storage.example.com/new-key' };

    vi.mocked(mockDataServices.users.findById).mockResolvedValue(userNoImage);
    vi.mocked(mockDataServices.users.update).mockResolvedValue(updatedUser);

    await useCase.execute('user-1', { image: 'https://storage.example.com/new-key' });

    expect(mockStorageService.deleteFile).not.toHaveBeenCalled();
  });

  it('should not look up the current user when image is not being updated', async () => {
    const updatedUser = { ...baseUser, name: 'Updated' };
    vi.mocked(mockDataServices.users.update).mockResolvedValue(updatedUser);

    await useCase.execute('user-1', { name: 'Updated' });

    expect(mockDataServices.users.findById).not.toHaveBeenCalled();
    expect(mockStorageService.deleteFile).not.toHaveBeenCalled();
  });

  it('should gracefully handle failure to delete old image', async () => {
    const userWithImage: UserEntity = {
      ...baseUser,
      image: 'https://storage.example.com/old-key',
    };
    const updatedUser = { ...baseUser, image: 'https://storage.example.com/new-key' };

    vi.mocked(mockDataServices.users.findById).mockResolvedValue(userWithImage);
    vi.mocked(mockStorageService.deleteFile).mockRejectedValue(new Error('Storage unavailable'));
    vi.mocked(mockDataServices.users.update).mockResolvedValue(updatedUser);

    const result = await useCase.execute('user-1', {
      image: 'https://storage.example.com/new-key',
    });

    expect(result).toEqual(updatedUser);
    expect(mockDataServices.users.update).toHaveBeenCalled();
  });
});
