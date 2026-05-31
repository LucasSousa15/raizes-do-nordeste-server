import { ApplicationError } from 'src/core/shared/errors/application.error';

export class RequireProductMissingError extends ApplicationError {
  constructor() {
    super('Product and price are required.', 400);
  }
}
