import type { IGenericRepository } from '../../../core';

export class PrismaGenericRepository<T> implements IGenericRepository<T> {
  private readonly _modelName: string;
  private readonly _prismaModel: any;
  private readonly _includeRelations: Record<string, boolean>;

  constructor(modelName: string, prismaModel: any, includeRelations: Record<string, boolean> = {}) {
    this._modelName = modelName;
    this._prismaModel = prismaModel;
    this._includeRelations = includeRelations;
  }

  async getAll(): Promise<T[]> {
    return this._prismaModel.findMany({
      include: this._includeRelations,
      orderBy: { createdAt: 'desc' },
    });
  }

  async get(id: string): Promise<T> {
    const result = await this._prismaModel.findUnique({
      where: { id },
      include: this._includeRelations,
    });

    if (!result) {
      throw new Error(`${this._modelName} with id ${id} not found`);
    }

    return result;
  }

  async create(item: T): Promise<T> {
    // Remove relations from create data to avoid conflicts
    const createData = this._sanitizeForCreate(item);

    return this._prismaModel.create({
      data: createData,
      include: this._includeRelations,
    });
  }

  async update(id: string, item: T): Promise<T> {
    const updateData = this._sanitizeForUpdate(item);

    return this._prismaModel.update({
      where: { id },
      data: updateData,
      include: this._includeRelations,
    });
  }

  // Helper: remove nested relations and computed fields for creation
  private _sanitizeForCreate(item: any): any {
    const sanitized = { ...item };
    delete sanitized.id;
    delete sanitized.createdAt;
    delete sanitized.updatedAt;

    // Remove relation objects (keep only IDs)
    for (const key of Object.keys(this._includeRelations)) {
      delete sanitized[key];
    }

    return sanitized;
  }

  // Helper: remove computed fields for updates
  private _sanitizeForUpdate(item: any): any {
    const sanitized = { ...item };
    delete sanitized.id;
    delete sanitized.createdAt;
    delete sanitized.updatedAt;

    // Remove relation objects (keep only IDs)
    for (const key of Object.keys(this._includeRelations)) {
      delete sanitized[key];
    }

    return sanitized;
  }
}
