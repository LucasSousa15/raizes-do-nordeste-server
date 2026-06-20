import { IGlobalStock } from '../../../domain/@types/global-stock';
import { IStoreStock, PaginatedStoreStocks } from '../../../domain/@types/store-stock';

export type StockView = IGlobalStock | IStoreStock;

export type PaginatedStocksView = Omit<PaginatedStoreStocks, 'data'> & { data: StockView[] };

export class StockViewModel {
  static toHTTP(stock: IGlobalStock): StockView;
  static toHTTP(stock: IStoreStock): StockView;
  static toHTTP(stock: null): null;
  static toHTTP(stock: IGlobalStock | IStoreStock | null): StockView | null;
  static toHTTP(stock: IGlobalStock | IStoreStock | null): StockView | null {
    if (!stock) return null;
    return stock as StockView;
  }

  static toHTTPList(stocks: IGlobalStock[] | IStoreStock[]): StockView[] {
    return stocks.map((s) => s as StockView);
  }
}