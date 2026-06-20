import { IStore, PaginatedStores } from 'src/modules/stores/domain/@types/store';
import type { Prisma, Store as PrismaStore } from '@prisma/client';

export class PrismaStoreMapper {
	static toPrisma(store: IStore): Prisma.StoreCreateInput {
		return {
			id: store.id,
			name: store.name,
			address: store.address,
			createdAt: store.createdAt,
			updatedAt: store.updatedAt,
		};
	}

	static toDomain(raw: PrismaStore): IStore {
		return {
			id: raw.id,
			name: raw.name,
			address: raw.address,
			createdAt: raw.createdAt,
			updatedAt: raw.updatedAt,
		};
	}
}

export class PrismaPaginatedStoresMapper {
	static toDomain(
		raw: PrismaStore[],
		meta: { totalItems: number; currentPage: number; itemsPerPage: number },
	): PaginatedStores {
		return {
			data: raw.map(PrismaStoreMapper.toDomain),
			meta: {
				totalItems: meta.totalItems,
				currentPage: meta.currentPage,
				itemsPerPage: meta.itemsPerPage,
				lastPage: Math.ceil(meta.totalItems / meta.itemsPerPage),
			},
		};
	}
}
