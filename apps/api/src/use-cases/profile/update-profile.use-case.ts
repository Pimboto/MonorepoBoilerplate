import { Injectable } from '@nestjs/common';
import { IDataServices } from '../../core';
import { IStorageService } from '../../core/abstracts/storage-service.abstract';
import type { UserEntity } from '../../core/entities/user.entity';

@Injectable()
export class UpdateProfileUseCase {
  constructor(
    private readonly dataServices: IDataServices,
    private readonly storageService: IStorageService,
  ) {}

  async execute(
    userId: string,
    input: { name?: string; image?: string | null },
  ): Promise<UserEntity> {
    // If replacing the profile image, delete the old one from storage
    if (input.image) {
      const currentUser = await this.dataServices.users.findById(userId);
      if (currentUser?.image) {
        const oldKey = currentUser.image.split('/').pop();
        if (oldKey) {
          try {
            await this.storageService.deleteFile(oldKey);
          } catch {
            // Non-critical: old image cleanup failed, continue with update
          }
        }
      }
    }

    return this.dataServices.users.update(userId, {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.image !== undefined && { image: input.image }),
    });
  }
}
