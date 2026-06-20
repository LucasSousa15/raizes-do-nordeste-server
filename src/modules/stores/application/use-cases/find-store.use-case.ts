import { Injectable } from "@nestjs/common";
import { StoreRepository } from "../../domain/repositories/store.repositories";
import { FindStoresReq, PaginatedStores } from "../../domain/@types/store";
import { StoreNotFoundError } from '../errors/store-not-found.error';


@Injectable()
export class FindStoreUseCase {
  constructor(
    private readonly storeRepository: StoreRepository,
  ) {}

  async execute(data: FindStoresReq): Promise<PaginatedStores> {
    const pageParam = Number(data.page ?? 1);
    const limitParam = Number(data.limit ?? 10);
    const page = Number.isNaN(pageParam) ? 1 : pageParam;
    const limit = Number.isNaN(limitParam) ? 10 : limitParam;

    if (data.storeId) {
      const store = await this.storeRepository.findById(data.storeId);
      if (!store) {
        throw new StoreNotFoundError();
      }
      return {
        data: [store],
        meta: {
          totalItems: 1,
          lastPage: 1,
          currentPage: 1,
          itemsPerPage: 10,
        },
      };
    }

    const allStores = await this.storeRepository.findAll(page, limit);
    return {
      data: allStores.stores,
      meta: {
        totalItems: allStores.total,
        lastPage: Math.ceil(allStores.total / limit),
        currentPage: page,
        itemsPerPage: limit,
      },
    };
    
  }
}