import { ApplicationError } from 'src/core/shared/errors/application.error';

export class IdempotencyKeyConflictError extends ApplicationError {
  constructor() {
    super('Chave de idempotência já utilizada em outro pedido.', 409);
  }
}