import { IStoreStock } from 'src/modules/stocks/domain/@types/store-stock';
import { StoreStockRepository } from 'src/modules/stocks/domain/repositories/store-stock.repositorie';

export class InMemoryStoreStockRepository implements StoreStockRepository {
  private items: IStoreStock[] = [];

  async findByStoreAndProduct(storeId: string, productId: string): Promise<IStoreStock | null> {
    return this.items.find(i => i.storeId === storeId && i.productId === productId) ?? null;
  }

  async upsertIncrement(storeId: string, productId: string, quantity: number): Promise<IStoreStock> {
    const idx = this.items.findIndex(i => i.storeId === storeId && i.productId === productId);
    if (idx !== -1) {
      this.items[idx].quantity += quantity;
      this.items[idx].updatedAt = new Date();
      return this.items[idx];
    }

    const newItem: IStoreStock = {
      id: (Math.random() * 1000000).toFixed(0),
      storeId,
      productId,
      quantity,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.items.push(newItem);
    return newItem;
  }

  async adjustQuantity(storeId: string, productId: string, delta: number): Promise<IStoreStock> {
    const idx = this.items.findIndex(i => i.storeId === storeId && i.productId === productId);
    if (idx === -1) throw new Error('StoreStock not found');
    this.items[idx].quantity += delta;
    this.items[idx].updatedAt = new Date();
    return this.items[idx];
  }

  async findByStoreId(storeId: string): Promise<IStoreStock[]> {
    return this.items.filter(i => i.storeId === storeId);
  }
}
