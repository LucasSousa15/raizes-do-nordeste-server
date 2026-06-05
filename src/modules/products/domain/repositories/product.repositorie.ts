import { FindProductsReq, IProduct, PaginatedProducts } from "../../@types/products";
import { Product } from "../entities/product.entitie";

export abstract class ProductRepository {
    abstract create(product: IProduct): Promise<void>;
    abstract findById(id: string): Promise<IProduct | null>;
    abstract findMany(params: FindProductsReq): Promise<PaginatedProducts>;
    abstract findByName(name: string, page: number, limit: number): Promise<PaginatedProducts | null>;
    abstract update(product: IProduct): Promise<void>;
    abstract delete(id: string): Promise<void>;
}
