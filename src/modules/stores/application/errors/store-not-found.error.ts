import { ApplicationError } from 'src/core/shared/errors/application.error';

export class StoreNotFoundError extends ApplicationError {
  constructor() {
    super('Loja não encontrada.', 404);
  }
}
