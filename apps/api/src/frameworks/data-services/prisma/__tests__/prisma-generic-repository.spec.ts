import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NotFoundError } from '../../../../core/errors';
import { PrismaGenericRepository } from '../prisma-generic-repository';

interface TestEntity {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  relation?: { id: string };
}

function createMockPrismaModel() {
  return {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  };
}

describe('PrismaGenericRepository', () => {
  let repository: PrismaGenericRepository<TestEntity>;
  let mockModel: ReturnType<typeof createMockPrismaModel>;
  const includeRelations = { relation: true };

  beforeEach(() => {
    mockModel = createMockPrismaModel();
    repository = new PrismaGenericRepository<TestEntity>('TestEntity', mockModel, includeRelations);
  });

  describe('get', () => {
    it('should return the entity when found', async () => {
      const entity: TestEntity = {
        id: 'entity-1',
        name: 'Test',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockModel.findUnique.mockResolvedValue(entity);

      const result = await repository.get('entity-1');

      expect(result).toEqual(entity);
      expect(mockModel.findUnique).toHaveBeenCalledWith({
        where: { id: 'entity-1' },
        include: includeRelations,
      });
    });

    it('should throw NotFoundError when entity is not found', async () => {
      mockModel.findUnique.mockResolvedValue(null);

      await expect(repository.get('nonexistent')).rejects.toThrow(NotFoundError);
      await expect(repository.get('nonexistent')).rejects.toThrow('TestEntity not found');
    });
  });

  describe('getAll', () => {
    it('should return all entities ordered by createdAt desc', async () => {
      const entities: TestEntity[] = [
        { id: '1', name: 'First', createdAt: new Date(), updatedAt: new Date() },
        { id: '2', name: 'Second', createdAt: new Date(), updatedAt: new Date() },
      ];

      mockModel.findMany.mockResolvedValue(entities);

      const result = await repository.getAll();

      expect(result).toEqual(entities);
      expect(mockModel.findMany).toHaveBeenCalledWith({
        include: includeRelations,
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should return an empty array when no entities exist', async () => {
      mockModel.findMany.mockResolvedValue([]);

      const result = await repository.getAll();

      expect(result).toEqual([]);
    });
  });

  describe('create', () => {
    it('should remove id, createdAt, updatedAt, and relation keys from input', async () => {
      const input: TestEntity = {
        id: 'should-be-removed',
        name: 'New Entity',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        relation: { id: 'rel-1' },
      };

      const created: TestEntity = {
        id: 'auto-generated',
        name: 'New Entity',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockModel.create.mockResolvedValue(created);

      const result = await repository.create(input);

      expect(result).toEqual(created);

      const createCall = mockModel.create.mock.calls[0][0];
      expect(createCall.data).not.toHaveProperty('id');
      expect(createCall.data).not.toHaveProperty('createdAt');
      expect(createCall.data).not.toHaveProperty('updatedAt');
      expect(createCall.data).not.toHaveProperty('relation');
      expect(createCall.data).toHaveProperty('name', 'New Entity');
      expect(createCall.include).toEqual(includeRelations);
    });
  });

  describe('update', () => {
    it('should remove id, createdAt, updatedAt, and relation keys from update data', async () => {
      const updateInput: TestEntity = {
        id: 'entity-1',
        name: 'Updated Name',
        createdAt: new Date(),
        updatedAt: new Date(),
        relation: { id: 'rel-1' },
      };

      const updated: TestEntity = {
        id: 'entity-1',
        name: 'Updated Name',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockModel.update.mockResolvedValue(updated);

      const result = await repository.update('entity-1', updateInput);

      expect(result).toEqual(updated);

      const updateCall = mockModel.update.mock.calls[0][0];
      expect(updateCall.where).toEqual({ id: 'entity-1' });
      expect(updateCall.data).not.toHaveProperty('id');
      expect(updateCall.data).not.toHaveProperty('createdAt');
      expect(updateCall.data).not.toHaveProperty('updatedAt');
      expect(updateCall.data).not.toHaveProperty('relation');
      expect(updateCall.data).toHaveProperty('name', 'Updated Name');
      expect(updateCall.include).toEqual(includeRelations);
    });
  });

  describe('without include relations', () => {
    it('should work correctly with empty include relations', async () => {
      const repoNoRelations = new PrismaGenericRepository<TestEntity>('TestEntity', mockModel);
      const entity: TestEntity = {
        id: '1',
        name: 'Test',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockModel.findUnique.mockResolvedValue(entity);

      const result = await repoNoRelations.get('1');

      expect(result).toEqual(entity);
      expect(mockModel.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: {},
      });
    });
  });
});
