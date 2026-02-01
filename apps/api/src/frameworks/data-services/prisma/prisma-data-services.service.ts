import { Injectable, type OnApplicationBootstrap } from '@nestjs/common';
import type { IDataServices } from '../../../core';
import { PrismaService } from './prisma.service';

@Injectable()
export class PrismaDataServices implements IDataServices, OnApplicationBootstrap {
  constructor(private readonly prisma: PrismaService) {}

  onApplicationBootstrap() {
    // Clean slate - repositories will be added when Better Auth entities are defined
  }
}
