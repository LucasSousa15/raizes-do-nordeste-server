export interface IStore {
    id: string;
    name: string;
    address: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface FindStoresReq {
    storeId?: string;
    storeName?: string;
    page?: number;
    limit?: number;
    createdAtStart?: Date;
    createdAtEnd?: Date;
}

export interface PaginatedStores {
    data: IStore[];
    meta: {
        totalItems: number;
        lastPage: number;
        currentPage: number;
        itemsPerPage: number;
    }
}