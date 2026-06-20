
export interface IGlobalStock {
	id: string;
	productId: string;
	quantity: number;
	createdAt: Date;
	updatedAt: Date;
}

export interface FindGlobalStocksReq {
	stockId?: string;
	productName?: string;
	productId?: string;
	page?: number;
	limit?: number;
}

export interface PaginatedGlobalStocks {
	data: IGlobalStock[];
	meta: {
		totalItems: number;
		lastPage: number;
		currentPage: number;
		itemsPerPage: number;
	};
}