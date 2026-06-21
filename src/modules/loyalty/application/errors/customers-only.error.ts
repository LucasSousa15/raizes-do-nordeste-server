import { ApplicationError } from 'src/core/shared/errors/application.error';

export class LoyaltyCustomersOnlyError extends ApplicationError {
  constructor() {
    super('Apenas clientes possuem programa de fidelidade.', 403);
  }
}
