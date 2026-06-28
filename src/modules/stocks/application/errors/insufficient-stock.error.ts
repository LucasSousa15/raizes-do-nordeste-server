import { ApplicationError } from 'src/core/shared/errors/application.error';

export class InsufficientStockError extends ApplicationError {
  constructor() {
    super('Estoque insuficiente.', 409);
  }
}

