import { Injectable } from "@nestjs/common";
import { StoreRepository } from "../../domain/repositories/store.repositories";
import { StoreNotFoundError } from "../errors/store-not-found.error";


@Injectable()
export class UpdateStoreUseCase {
    constructor(private readonly storeRepository: StoreRepository) {}

    async execute(storeId: string, name?: string, address?: string) {
        const store = await this.storeRepository.findById(storeId);
        
        if (!store) {
            throw new StoreNotFoundError();
        }

        store.name = name ?? store.name;
        store.address = address ?? store.address;
        store.updatedAt = new Date();

        await this.storeRepository.update(store);
    }
}