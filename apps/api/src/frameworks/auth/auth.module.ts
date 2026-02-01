import { Module } from '@nestjs/common';
// Removed @thallesp/nestjs-better-auth to avoid global guards
// Auth is now handled via main.ts middleware and local guards

@Module({
  imports: [],
  exports: [],
})
export class AuthModule {}
