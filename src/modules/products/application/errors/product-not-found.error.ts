import { ApplicationError } from 'src/core/shared/errors/application.error';

export class ProductNotFoundError extends ApplicationError {
  constructor() {
    super('Product not found.', 404);
  }
}
