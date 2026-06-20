import { Stock } from '../../../../domain/entities/stock.entitie';

export class PrismaStocksMapper {
  static toDomain(prismaStock: any): Stock {
    // TODO: implementar mapeamento Prisma -> Domínio
    throw new Error('Method not implemented.');
  }

  static toPrisma(stock: Stock): any {
    // TODO: implementar mapeamento Domínio -> Prisma
    throw new Error('Method not implemented.');
  }
}