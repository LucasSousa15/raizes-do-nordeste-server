import { IUser, PaginatedUsers, UserStatus } from '../../@types/users';

export abstract class UsersRepository {
  abstract create(user: IUser): Promise<IUser>;
  abstract findByEmail(email: string): Promise<IUser | null>;
  abstract findById(id: string): Promise<IUser | null>;
  abstract findByStatus(
    status: UserStatus,
    page?: number,
    limit?: number,
  ): Promise<PaginatedUsers>;
  abstract findMany(page?: number, limit?: number): Promise<PaginatedUsers>;
  abstract update(user: IUser): Promise<IUser>;
  abstract delete(id: string): Promise<void>;
}
