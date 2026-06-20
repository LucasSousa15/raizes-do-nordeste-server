import { Injectable } from "@nestjs/common";
import { StoreRepository } from "../../domain/repositories/store.repositories";
import { IStore } from "../../domain/@types/store";


@Injectable()
export class CreateStoreUseCase {
    constructor(private readonly storeRepository: StoreRepository) {}

    async execute({name, address}: Omit<IStore, 'id' | 'createdAt' | 'updatedAt'>) {
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