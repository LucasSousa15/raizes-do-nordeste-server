import { ApplicationError } from 'src/core/shared/errors/application.error';

export class InsufficientPointsError extends ApplicationError {
  constructor() {
    super('Pontos insuficientes para resgate.', 409);
  }
}
