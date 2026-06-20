import { ApplicationError } from 'src/core/shared/errors/application.error';

export class RequireProductMissingError extends ApplicationError {
  constructor() {
    super('Produto e preço são obrigatórios.', 400);
  }
}
