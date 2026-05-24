import { FindUserUseCase } from 'src/modules/accounts/application/use-cases/find-users.use-case';
import { InMemoryUsersRepository } from '../repositories/in-memory.users.repository';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  PaginatedUsers,
  UserRole,
  UserStatus,
} from 'src/modules/accounts/@types/users';

let usersRepository: InMemoryUsersRepository;
let sut: FindUserUseCase;

describe('Find users tests', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    sut = new FindUserUseCase(usersRepository);

    usersRepository.create({
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'password',
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      id: 'user-1',
    });
  });

  afterEach(() => {
    usersRepository.items = [];
  });

  it('Should be able to find all users when no filters are provided', async () => {
    const { user } = await sut.execute({});

    expect(user).not.toBeNull();
    if (!user || !('data' in user)) throw new Error('Expected paginated users');

    expect(user.data).toHaveLength(1);
    expect(user.data[0].email).toBe('john.doe@example.com');
  });

  it('Should be able to find user by id', async () => {
    const { user } = await sut.execute({ id: 'user-1' });

    expect(user).not.toBeInstanceOf(Array);
    expect(user).toHaveProperty('id', 'user-1');
  });

  it('Should be able to find user by email', async () => {
    const { user } = await sut.execute({ email: 'john.doe@example.com' });

    expect(user).not.toBeInstanceOf(Array);
    expect(user).toHaveProperty('email', 'john.doe@example.com');
  });

  it('Should be able to find users by status', async () => {
    const { user } = await sut.execute({ status: UserStatus.ACTIVE });

    expect(user).not.toBeNull();
    expect((user as PaginatedUsers).data).toHaveLength(1);
  });

  it('Should return empty array when no user matches the status', async () => {
    const { user } = await sut.execute({ status: UserStatus.INACTIVE });

    expect(user).not.toBeNull();
    expect((user as PaginatedUsers).data).toHaveLength(0);
  });
});
