import { Module } from '@nestjs/common';
import { IDataServices } from '../../../core';
import { PrismaService } from './prisma.service';
import { PrismaDataServices } from './prisma-data-services.service';

@Module({
  providers: [
    PrismaService,
    {
      provide: IDataServices,
      useClass: PrismaDataServices,
    },
  ],
  exports: [IDataServices, PrismaService],
})
export class PrismaDataServicesModule {}
