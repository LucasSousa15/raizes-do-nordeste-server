import { ApplicationError } from 'src/core/shared/errors/application.error';

export class InvalidCredentialsError extends ApplicationError {
  constructor() {
    super('Credenciais inválidas.', 401);
  }
}
