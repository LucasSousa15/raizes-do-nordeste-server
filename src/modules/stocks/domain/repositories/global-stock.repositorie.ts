import { IGlobalStock } from '../@types/global-stock';

export abstract class GlobalStockRepository {
  abstract findByProductId(id: string): Promise<IGlobalStock | null>;
  abstract findAll(): Promise<IGlobalStock[]>;
  abstract findByStoreId(storeId: string): Promise<IGlobalStock[]>;
  abstract updateByStoreId(storeId: string, data: Partial<IGlobalStock>): Promise<IGlobalStock>;
  abstract delete(id: string): Promise<void>;
}