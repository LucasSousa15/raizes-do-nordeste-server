
export interface IProduct {
    id: string;
    name: string;
    description?: string;
    price: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface FindProductsReq {
    productId?: string;
    name?: string;
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    limit?: number;
    createdAtStart?: Date;
    createdAtEnd?: Date; 
}

export interface PaginatedProducts {
    data: IProduct[];
    meta: {
        totalItems: number;
        lastPage: number;
        currentPage: number;
        itemsPerPage: number;
    };
}