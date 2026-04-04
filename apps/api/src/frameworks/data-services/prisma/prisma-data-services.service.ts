import { Injectable, type OnApplicationBootstrap } from '@nestjs/common';
import type { ICollectionRepository, IDataServices, IFileRepository } from '../../../core';
import { PrismaService } from './prisma.service';
import { PrismaCollectionRepository } from './prisma-collection.repository';
import { PrismaFileRepository } from './prisma-file.repository';

@Injectable()
export class PrismaDataServices implements IDataServices, OnApplicationBootstrap {
  collections: ICollectionRepository;
  files: IFileRepository;

  constructor(readonly prisma: PrismaService) {}

  onApplicationBootstrap() {
    this.collections = new PrismaCollectionRepository();
    this.files = new PrismaFileRepository();
  }
}
