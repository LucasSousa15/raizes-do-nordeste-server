import { IStore } from "../@types/store";

export abstract class StoreRepository {
    abstract create(store: IStore): Promise<void>;
    abstract findById(id: string): Promise<IStore | null>;
    abstract findAll(page: number, limit: number): Promise<{ stores: IStore[]; total: number }>;
    abstract update(store: IStore): Promise<void>;
    abstract delete(id: string): Promise<void>;
}