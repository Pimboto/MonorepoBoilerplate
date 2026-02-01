import { Global, Module } from '@nestjs/common';
import { PrismaDataServicesModule } from '../../frameworks/data-services/prisma/prisma-data-services.module';

@Global()
@Module({
  imports: [PrismaDataServicesModule],
  exports: [PrismaDataServicesModule],
})
export class DataServicesModule {}
