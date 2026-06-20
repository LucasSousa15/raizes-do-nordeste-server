export interface IStoreStock {
  id: string;
  storeId: string;
  productId: string;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface FindStoreStocksReq {
  storeId?: string;
  productId?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedStoreStocks {
  data: IStoreStock[];
  meta: {
    totalItems: number;
    lastPage: number;
    currentPage: number;
    itemsPerPage: number;
  };
}
