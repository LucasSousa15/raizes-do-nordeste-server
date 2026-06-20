
import { StoreRepository } from 'src/modules/stores/domain/repositories/store.repositories';
import { PrismaService } from 'src/core/providers/database/models/prisma.service';
import { IStore } from 'src/modules/stores/domain/@types/store';
import { PrismaStoreMapper } from '../mappers/prisma-store.mapper';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Injectable()
export class PrismaStoresRepository implements StoreRepository {
	constructor(private prisma: PrismaService) {}

	create(store: IStore): Promise<void> {
		const prismaStore = PrismaStoreMapper.toPrisma(store);
		return this.prisma.store.create({ data: prismaStore }).then(() => {});
	}

	findById(id: string): Promise<IStore | null> {
		return this.prisma.store.findUnique({ where: { id } }).then((store) => {
			if (!store) return null;
			return PrismaStoreMapper.toDomain(store);
		});
	}

	async findAll(page: number, limit: number): Promise<{ stores: IStore[]; total: number }> {
		const currentPage = Math.max(Number(page) || 1, 1);
		const itemsPerPage = Math.max(Number(limit) || 10, 1);

		const [stores, totalItems] = await Promise.all([
			this.prisma.store.findMany({
				skip: (currentPage - 1) * itemsPerPage,
				take: itemsPerPage,
				orderBy: { createdAt: 'desc' },
			}),
			this.prisma.store.count(),
		]);

		return { stores: stores.map(PrismaStoreMapper.toDomain), total: totalItems };
	}

	update(store: IStore): Promise<void> {
		const prismaStore = PrismaStoreMapper.toPrisma(store);

		return this.prisma.store.update({ where: { id: store.id }, data: prismaStore }).then(() => undefined);
	}

	delete(id: string): Promise<void> {
		return this.prisma.store.delete({ where: { id } }).then(() => undefined);
	}
}