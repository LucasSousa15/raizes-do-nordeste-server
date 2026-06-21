import { ApplicationError } from 'src/core/shared/errors/application.error';

export class OrderNotFoundError extends ApplicationError {
  constructor() {
    super('Pedido não encontrado.', 404);
  }
}
