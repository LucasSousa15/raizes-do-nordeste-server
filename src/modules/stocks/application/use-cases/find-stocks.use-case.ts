import { Injectable } from '@nestjs/common';
import { StockRepository } from '../../domain/repositories/stock.repositorie';
import { Stock } from '../../domain/entities/stock.entitie';

@Injectable()
export class FindStocksUseCase {
  constructor(private readonly stockRepository: StockRepository) {}

  async execute(query: any): Promise<Stock[]> {
    // TODO: implementar
    throw new Error('Method not implemented.');
  }
}