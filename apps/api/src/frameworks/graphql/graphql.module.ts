import { Module } from '@nestjs/common';
import { IStorageService } from '../../core/abstracts/storage-service.abstract';
import { SignInUseCase, SignOutUseCase, SignUpUseCase } from '../../use-cases/auth';
import {
  CreateCollectionUseCase,
  DeleteCollectionUseCase,
  GetCollectionsUseCase,
  GetCollectionUseCase,
  UpdateCollectionUseCase,
} from '../../use-cases/collection';
import {
  CreateFileUseCase,
  DeleteFileUseCase,
  GetFilesByCollectionUseCase,
} from '../../use-cases/file';
import {
  RequestPasswordResetUseCase,
  ResetPasswordUseCase,
  SendVerificationOtpUseCase,
  VerifyEmailUseCase,
} from '../../use-cases/otp';
import {
  ChangePasswordUseCase,
  ListSessionsUseCase,
  RevokeSessionUseCase,
  UpdateProfileUseCase,
} from '../../use-cases/profile';
import { AuthModule } from '../auth/auth.module';
import { LoggerService } from '../logger';
import { UploadThingStorageService } from '../storage/uploadthing-storage.service';
import { GraphQLConfigModule } from './graphql-config.module';
import { AuthResolver } from './resolvers/auth.resolver';
import { CollectionResolver } from './resolvers/collection.resolver';
import { FileResolver } from './resolvers/file.resolver';
import { OtpResolver } from './resolvers/otp.resolver';
import { ProfileResolver } from './resolvers/profile.resolver';
import { UserResolver } from './resolvers/user.resolver';

@Module({
  imports: [GraphQLConfigModule, AuthModule],
  providers: [
    UserResolver,
    AuthResolver,
    CollectionResolver,
    FileResolver,
    OtpResolver,
    ProfileResolver,
    LoggerService,
    { provide: IStorageService, useClass: UploadThingStorageService },
    SignUpUseCase,
    SignInUseCase,
    SignOutUseCase,
    CreateCollectionUseCase,
    DeleteCollectionUseCase,
    GetCollectionUseCase,
    GetCollectionsUseCase,
    UpdateCollectionUseCase,
    CreateFileUseCase,
    DeleteFileUseCase,
    GetFilesByCollectionUseCase,
    SendVerificationOtpUseCase,
    VerifyEmailUseCase,
    RequestPasswordResetUseCase,
    ResetPasswordUseCase,
    ChangePasswordUseCase,
    ListSessionsUseCase,
    RevokeSessionUseCase,
    UpdateProfileUseCase,
  ],
})
export class GraphQLApiModule {}
