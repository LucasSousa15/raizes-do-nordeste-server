import { ApplicationError } from 'src/core/shared/errors/application.error';

export class CustomersOnlyError extends ApplicationError {
  constructor() {
    super('Apenas clientes podem criar pedidos.', 403);
  }
}
