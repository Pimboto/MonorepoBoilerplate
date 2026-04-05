import type { UserEntity } from '../entities/user.entity';

export abstract class IUserRepository {
  abstract findById(id: string): Promise<UserEntity | null>;
  abstract update(id: string, data: Partial<UserEntity>): Promise<UserEntity>;
}
