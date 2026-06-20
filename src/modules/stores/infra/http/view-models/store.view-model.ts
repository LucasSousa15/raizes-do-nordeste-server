import { IStore, PaginatedStores } from 'src/modules/stores/domain/@types/store';

export type StoreView = IStore;

export type PaginatedStoresView = Omit<PaginatedStores, 'data'> & {
  data: StoreView[];
};

export type FindStoreView = {
  store: StoreView | PaginatedStoresView | null;
};

export class StoreViewModel {
  static toHTTP(store: IStore): StoreView;
  static toHTTP(stores: PaginatedStores): PaginatedStoresView;
  static toHTTP(store: null): null;
  static toHTTP(store: IStore | PaginatedStores | null): StoreView | PaginatedStoresView | null;
  static toHTTP(store: IStore | PaginatedStores | null): StoreView | PaginatedStoresView | null {
    if (!store) return null;

    if ('data' in store) {
      return {
        data: store.data.map((item) => StoreViewModel.toHTTP(item) as StoreView),
        meta: store.meta,
      };
    }

    return store;
  }
}
