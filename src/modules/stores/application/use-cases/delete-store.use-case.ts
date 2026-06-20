import { Injectable } from "@nestjs/common";
import { StoreRepository } from "../../domain/repositories/store.repositories";
import { StoreNotFoundError } from "../errors/store-not-found.error";
import { StoreHasStockError } from "../errors/store-has-stock.error";


@Injectable()
export class DeleteStoreUseCase {
    constructor(private readonly storeRepository: StoreRepository) { }

    async execute(storeId: string) {

        const store = await this.storeRepository.findById(storeId);

        if (!store) {
            throw new StoreNotFoundError();
        }

        const hasStock = await this.storeRepository.hasStock(storeId);
        if (hasStock) {
            throw new StoreHasStockError();
        }

        await this.storeRepository.delete(storeId);
    }

}