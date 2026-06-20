import { ApplicationError } from 'src/core/shared/errors/application.error';

export class InvalidPriceError extends ApplicationError {
  constructor() {
    super('O preço deve ser um valor positivo.', 400);
  }
}
