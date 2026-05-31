import { ApplicationError } from 'src/core/shared/errors/application.error';

export class InvalidPriceError extends ApplicationError {
  constructor() {
    super('Price must be a positive value.', 400);
  }
}
