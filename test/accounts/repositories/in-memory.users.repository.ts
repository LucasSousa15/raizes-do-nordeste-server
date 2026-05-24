import {
  IUser,
  PaginatedUsers,
  UserStatus,
} from 'src/modules/accounts/@types/users';
import { UsersRepository } from 'src/modules/accounts/domain/repositories/users.repositories';

export class InMemoryUsersRepository implements UsersRepository {
  public items: IUser[] = [];

  async create(user: IUser): Promise<IUser> {
    this.items.push(user);
    return user;
  }

  async findByEmail(email: string): Promise<IUser | null> {
    const user = this.items.find((item) => item.email === email);
    return user || null;
  }

  async findById(id: string): Promise<IUser | null> {
    const user = this.items.find((item) => item.id === id);
    return user || null;
  }

  async findMany(page = 1, limit = 10): Promise<PaginatedUsers> {
    const currentPage = Math.max(Number(page), 1);
    const itemsPerPage = Math.max(Number(limit), 1);
    const start = (currentPage - 1) * itemsPerPage;
    const paginatedItems = this.items.slice(start, start + itemsPerPage);

    return {
      data: paginatedItems,
      meta: {
        totalItems: this.items.length,
        lastPage: Math.ceil(this.items.length / itemsPerPage),
        currentPage,
        itemsPerPage,
      },
    };
  }

  async findByStatus(
    status: UserStatus,
    page = 1,
    limit = 10,
  ): Promise<PaginatedUsers> {
    const filteredItems = this.items.filter((item) => item.status === status);
    const currentPage = Math.max(Number(page), 1);
    const itemsPerPage = Math.max(Number(limit), 1);
    const start = (currentPage - 1) * itemsPerPage;
    const paginatedItems = filteredItems.slice(start, start + itemsPerPage);

    return {
      data: paginatedItems,
      meta: {
        totalItems: filteredItems.length,
        lastPage: Math.ceil(filteredItems.length / itemsPerPage),
        currentPage,
        itemsPerPage,
      },
    };
  }

  async update(user: IUser): Promise<IUser> {
    const index = this.items.findIndex((item) => item.id === user.id);
    if (index === -1) {
      throw new Error('User not found');
    }
    this.items[index] = user;
    return user;
  }

  async delete(id: string): Promise<void> {
    const index = this.items.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new Error('User not found');
    }
    this.items.splice(index, 1);
  }
}
