import { ApplicationError } from 'src/core/shared/errors/application.error';

export class ProductNotFoundError extends ApplicationError {
  constructor() {
    super('Produto não encontrado.', 404);
  }
}
