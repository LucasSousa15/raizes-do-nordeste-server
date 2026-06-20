import { Stock } from '../entities/stock.entitie';

export abstract class StockRepository {
  abstract create(data: any): Promise<Stock>;
  abstract findAll(): Promise<Stock[]>;
  abstract findById(id: string): Promise<Stock | null>;
  abstract update(id: string, data: any): Promise<Stock>;
  abstract delete(id: string): Promise<void>;
}