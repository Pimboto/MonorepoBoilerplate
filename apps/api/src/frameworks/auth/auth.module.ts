import { Module } from '@nestjs/common';
import { IAuthService } from '../../core/abstracts/auth-service.abstract';
import { BetterAuthService } from './better-auth.service';

@Module({
  providers: [{ provide: IAuthService, useClass: BetterAuthService }],
  exports: [IAuthService],
})
export class AuthModule {}
