import { ApplicationError } from 'src/core/shared/errors/application.error';

export class ConsentRequiredError extends ApplicationError {
  constructor() {
    super('Consentimento LGPD necessario para resgate de pontos.', 403);
  }
}
