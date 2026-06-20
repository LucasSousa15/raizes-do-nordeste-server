import { Injectable } from "@nestjs/common";
import { StoreRepository } from "../../domain/repositories/store.repositories";
import { StoreNotFoundError } from "../errors/store-not-found.error";


@Injectable()
export class DeleteStoreUseCase {
    constructor(private readonly storeRepository: StoreRepository) { }

    async execute(storeId: string) {

        const store = await this.storeRepository.findById(storeId);

        if (!store) {
            throw new StoreNotFoundError();
        }

        await this.storeRepository.delete(storeId);
    }

}