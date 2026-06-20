import { Module } from "@nestjs/common";
import { StoresController } from "./infra/http/controllers/stores.controller";
import { CreateStoreUseCase } from "./application/use-cases/create-store.use-case";
import { FindStoreUseCase } from "./application/use-cases/find-store.use-case";
import { UpdateStoreUseCase } from "./application/use-cases/update-store.use-case";
import { DeleteStoreUseCase } from "./application/use-cases/delete-store.use-case";
import { StoreRepository } from "./domain/repositories/store.repositories";
import { PrismaStoresRepository } from "./infra/database/prisma/repositories/prisma-store.repositorie";


@Module({
    controllers: [StoresController],
    providers: [CreateStoreUseCase, FindStoreUseCase, UpdateStoreUseCase, DeleteStoreUseCase, { provide: StoreRepository, useClass: PrismaStoresRepository }],
    exports: [StoreRepository],
})
export class StoresModule {}