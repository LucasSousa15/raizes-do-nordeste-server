import { Injectable } from "@nestjs/common";
import { StoreRepository } from "../../domain/repositories/store.repositories";
import { IStore } from "../../domain/@types/store";
import { StoreAddressUnavailableError } from "../errors/store-addres-unavailable.error";


@Injectable()
export class CreateStoreUseCase {
    constructor(private readonly storeRepository: StoreRepository) {}
    
    async execute({name, address}: Omit<IStore, 'id' | 'createdAt' | 'updatedAt'>) {
        const stores = await this.storeRepository.findAll(1, 100);

        const existingStore = stores.stores.find(store => store.address === address);
        if (existingStore) {
            throw new StoreAddressUnavailableError();
        }

        const newStore = await this.storeRepository.create({
            name,
            address,
            id: crypto.randomUUID(),
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        return newStore;
    }
}