
import { GlobalStockRepository } from "src/modules/stocks/domain/repositories/global-stock.repositorie";
import { ProductRepository } from "src/modules/products/domain/repositories/product.repositorie";
import { StoreRepository } from "src/modules/stores/domain/repositories/store.repositories";
import { ProductNotFoundError } from "src/modules/products/application/errors/product-not-found.error";
import { StoreNotFoundError } from "src/modules/stores/application/errors/store-not-found.error";
import { IGlobalStock } from "src/modules/stocks/domain/@types/global-stock";

export class InMemoryGlobalStockRepository implements GlobalStockRepository {
    private globalStocks: IGlobalStock[] = [];

    constructor(
        private productRepository?: ProductRepository,
    ) {}

    async findByStoreId(storeId: string): Promise<IGlobalStock[]> {

        return [];
    }

    async updateByStoreId(storeId: string, data: Partial<IGlobalStock>): Promise<IGlobalStock> {
        throw new Error('updateByStoreId is not supported for computed GlobalStock');
    }

    async delete(id: string): Promise<void> {
        const idx = this.globalStocks.findIndex(s => s.id === id);
        if (idx === -1) throw new ProductNotFoundError();
        this.globalStocks.splice(idx, 1);
    }

    async create(data: Omit<IGlobalStock, 'id' | 'createdAt' | 'updatedAt'>): Promise<IGlobalStock> {
        if (this.productRepository) {
            const product = await this.productRepository.findById(data.productId);
            if (!product) throw new ProductNotFoundError();
        }

        const newGlobalStock: IGlobalStock = {
            id: (Math.random() * 1000000).toString(),
            productId: data.productId,
            quantity: data.quantity,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        this.globalStocks.push(newGlobalStock);
        return newGlobalStock;
    }

    async findByProductId(id: string): Promise<IGlobalStock | null> {
        return this.globalStocks.find(stock => stock.productId === id) || null;
    }

    async findByProductName({name, page, limit}: {name: string, page: number, limit: number}): Promise<IGlobalStock | null> {
        const pageResult = await this.productRepository?.findByName(name, page, limit);
        if (!pageResult || pageResult.data.length === 0) throw new ProductNotFoundError();

        const product = pageResult.data[0];
        return this.globalStocks.find(stock => stock.productId === product.id) || null;
    }

    async findAll(): Promise<IGlobalStock[]> {
        return this.globalStocks;
    }

    async updateProductById(id: string): Promise<IGlobalStock> {
        const stockIndex = this.globalStocks.findIndex(stock => stock.productId === id);
        if (stockIndex === -1) throw new ProductNotFoundError();
        this.globalStocks[stockIndex].quantity += 1;
        return this.globalStocks[stockIndex];
    }

    async adjustQuantity(productId: string, delta: number): Promise<IGlobalStock> {
        throw new Error('adjustQuantity is not supported for computed GlobalStock');
    }

    async deleteByProductId(id: string): Promise<void> {
        const stockIndex = this.globalStocks.findIndex(stock => stock.productId === id);
        if (stockIndex === -1) throw new ProductNotFoundError();
        this.globalStocks.splice(stockIndex, 1);
    }

}