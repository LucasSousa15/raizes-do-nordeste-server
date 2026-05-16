import { IUser, PaginatedUsers } from "src/modules/accounts/@types/users";
import { UsersRepository } from "src/modules/accounts/domain/repositories/users.repositories";

export class InMemoryUsersRepository  implements UsersRepository {
    public items : IUser[] = [];

    async create(user: IUser): Promise<IUser> {
        this.items.push(user);
        return user;    
    }

    async findByEmail(email: string): Promise<IUser | null> {
        const user = this.items.find(item => item.email === email);
        return user || null;
    }

    async findById(id: string): Promise<IUser | null> {
        const user = this.items.find(item => item.id === id);
        return user || null;
    }

    async findMany(): Promise<PaginatedUsers> {
        return {
            data: this.items,
            meta: {
                totalItems: this.items.length,
                lastPage: 1,
                currentPage: 1,
                itemsPerPage: this.items.length
            }
        };
    }

    async update(user: IUser): Promise<IUser> {
        const index = this.items.findIndex(item => item.id === user.id);
        if (index === -1) {
            throw new Error("User not found");
        }
        this.items[index] = user;
        return user;
    }

    async delete(id: string): Promise<void> {
        const index = this.items.findIndex(item => item.id === id);
        if (index === -1) {
            throw new Error("User not found");
        }
        this.items.splice(index, 1);
    }
}