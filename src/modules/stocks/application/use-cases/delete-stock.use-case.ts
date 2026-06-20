import { Injectable } from '@nestjs/common';
import { StockRepository } from '../../domain/repositories/stock.repositorie';

@Injectable()
export class DeleteStockUseCase {
  constructor(private readonly stockRepository: StockRepository) {}

  async execute(id: string): Promise<void> {
    // TODO: implementar
    throw new Error('Method not implemented.');
  }
}