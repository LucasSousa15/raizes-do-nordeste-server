import { IUser } from "../../@types/users.type";

export abstract class UsersRepository {
    abstract create(user: IUser): Promise<IUser>;
    abstract findByEmail(email: string): Promise<IUser | null>;
    abstract findById(id: string): Promise<IUser | null>;
    abstract findMany(): Promise<IUser[]>;
    abstract update(user: IUser): Promise<IUser>;
    abstract delete(id: string): Promise<void>;
}