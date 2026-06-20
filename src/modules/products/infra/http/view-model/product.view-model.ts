import {
  IProduct,
  PaginatedProducts,
} from 'src/modules/products/domain/@types/products';

export type ProductView = IProduct;

export type PaginatedProductsView = Omit<PaginatedProducts, 'data'> & {
  data: ProductView[];
};

export type FindProductView = {
  product: ProductView | PaginatedProductsView | null;
};

export class ProductViewModel {
  static toHTTP(product: IProduct): ProductView;
  static toHTTP(product: PaginatedProducts): PaginatedProductsView;
  static toHTTP(product: null): null;
  static toHTTP(
    product: IProduct | PaginatedProducts | null,
  ): ProductView | PaginatedProductsView | null;
  static toHTTP(
    product: IProduct | PaginatedProducts | null,
  ): ProductView | PaginatedProductsView | null {
    if (!product) return null;

    if ('data' in product) {
      return {
        data: product.data.map((item) => ProductViewModel.toHTTP(item)),
        meta: product.meta,
      };
    }

    return product;
  }
}
