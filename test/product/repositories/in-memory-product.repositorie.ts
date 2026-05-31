import {  FindProductsReq, IProduct, PaginatedProducts } from "src/modules/products/@types/products";
import { Product } from "src/modules/products/domain/entities/product.entitie";
import { ProductRepository } from "src/modules/products/domain/repositories/product.repositorie";



export class InMemoryProductRepository implements ProductRepository {
    public items: IProduct[] = [];

    private paginate(items: IProduct[], page: number, limit: number): PaginatedProducts {
        const currentPage = Number.isNaN(Number(page)) ? 1 : Number(page);
        const itemsPerPage = Number.isNaN(Number(limit)) ? 10 : Number(limit);
        const start = (currentPage - 1) * itemsPerPage;
        const paginatedItems = items.slice(start, start + itemsPerPage);

        return {
            data: paginatedItems,
            meta: {
                totalItems: items.length,
                lastPage: Math.ceil(items.length / itemsPerPage),
                currentPage,
                itemsPerPage,
            },
        };
    }

    async create(product: IProduct): Promise<void> {
        this.items.push(product);
    }

    async findById(id: string): Promise<IProduct | null> {
        const product = this.items.find((item) => item.id === id);
        return product ?? null;
    }

    async findByName(name: string, page: number, limit: number): Promise<PaginatedProducts | null> {
        const normalizedName = name.toLowerCase();
        const filteredItems = this.items.filter((item) => item.name.toLowerCase().includes(normalizedName));
        if (filteredItems.length === 0) {
            return null;
        }
        return this.paginate(filteredItems, page, limit);
    }

    async findAll(params: FindProductsReq): Promise<PaginatedProducts> {
        let filteredItems = this.items;

        if (params.productId) {
            filteredItems = filteredItems.filter(item => item.id === params.productId);
        }
        if (params.name) {
            const normalizedName = params.name.toLowerCase();
            filteredItems = filteredItems.filter(item => item.name.toLowerCase().includes(normalizedName));
        }
        if (params.minPrice !== undefined) {
            filteredItems = filteredItems.filter(item => item.price >= params.minPrice!);
        }

        if (params.maxPrice !== undefined) {
            filteredItems = filteredItems.filter(item => item.price <= params.maxPrice!);
        }

        return this.paginate(filteredItems, params.page ?? 1, params.limit ?? 10);
    }

    async update(product: Product): Promise<void> {
        const index = this.items.findIndex((item) => item.id === product.id); 
        if (index !== -1) {
            this.items[index] = {
                ...this.items[index],
                ...product,
                updatedAt: new Date(),
            };
        }
    }

    async delete(id: string): Promise<void> {
        this.items = this.items.filter((item) => item.id !== id);
    }
}
