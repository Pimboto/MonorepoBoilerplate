import { Injectable, type OnApplicationBootstrap } from '@nestjs/common';
import type {
  ICollectionRepository,
  IDataServices,
  IFileRepository,
  IUserRepository,
} from '../../../core';
import { PrismaService } from './prisma.service';
import { PrismaCollectionRepository } from './prisma-collection.repository';
import { PrismaFileRepository } from './prisma-file.repository';
import { PrismaUserRepository } from './prisma-user.repository';

@Injectable()
export class PrismaDataServices implements IDataServices, OnApplicationBootstrap {
  collections: ICollectionRepository;
  files: IFileRepository;
  users: IUserRepository;

  constructor(readonly prisma: PrismaService) {}

  onApplicationBootstrap() {
    this.collections = new PrismaCollectionRepository();
    this.files = new PrismaFileRepository();
    this.users = new PrismaUserRepository();
  }
}
