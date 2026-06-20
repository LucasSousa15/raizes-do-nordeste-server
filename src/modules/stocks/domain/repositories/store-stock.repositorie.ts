import { IStoreStock } from '../@types/store-stock';

export abstract class StoreStockRepository {
  abstract findByStoreAndProduct(storeId: string, productId: string): Promise<IStoreStock | null>;
  abstract upsertIncrement(storeId: string, productId: string, quantity: number): Promise<IStoreStock>;
  abstract adjustQuantity(storeId: string, productId: string, delta: number): Promise<IStoreStock>;
  abstract findByStoreId(storeId: string): Promise<IStoreStock[]>;
}
