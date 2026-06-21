import {
  StoreMenuItem,
  StoreMenuResult,
} from '../../../application/use-cases/get-store-menu.use-case';

export type StoreMenuItemView = StoreMenuItem;

export type StoreMenuView = {
  storeId: string;
  storeName: string;
  items: StoreMenuItemView[];
};

export class StoreMenuViewModel {
  static toHTTP(menu: StoreMenuResult): StoreMenuView {
    return {
      storeId: menu.storeId,
      storeName: menu.storeName,
      items: menu.items,
    };
  }
}
