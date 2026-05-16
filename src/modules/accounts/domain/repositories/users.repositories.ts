import { IUser, PaginatedUsers } from "../../@types/users";

export abstract class UsersRepository {
    abstract create(user: IUser): Promise<IUser>;
    abstract findByEmail(email: string): Promise<IUser | null>;
    abstract findById(id: string): Promise<IUser | null>;
    abstract findMany(): Promise<PaginatedUsers>;
    abstract update(user: IUser): Promise<IUser>;
    abstract delete(id: string): Promise<void>;
}