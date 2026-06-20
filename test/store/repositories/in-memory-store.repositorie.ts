import { IStore } from "src/modules/stores/domain/@types/store";
import { StoreRepository } from "src/modules/stores/domain/repositories/store.repositories";


export class InMemoryStoreRepository implements StoreRepository {
    public items: IStore[] = [];

    private paginate(items: IStore[], page: number, limit: number): { stores: IStore[]; total: number } {
        const currentPage = Number.isNaN(Number(page)) ? 1 : Number(page);
        const itemsPerPage = Number.isNaN(Number(limit)) ? 10 : Number(limit);
        const start = (currentPage - 1) * itemsPerPage;
        const paginatedItems = items.slice(start, start + itemsPerPage);

        return { stores: paginatedItems, total: items.length };
    }

    async create(store: IStore): Promise<void> {
        this.items.push(store);
    }

    async findById(id: string): Promise<IStore | null> {
        const store = this.items.find((item) => item.id === id);
        return store ?? null;
    }

    async findAll(page: number, limit: number): Promise<{ stores: IStore[]; total: number }> {
        return this.paginate(this.items, page, limit);
    }

    async update(store: IStore): Promise<void> {
        const index = this.items.findIndex((item) => item.id === store.id); 
        if (index !== -1) {
            this.items[index] = store;
        }

    }

    async delete(id: string): Promise<void> {
        this.items = this.items.filter((item) => item.id !== id);
    }


}