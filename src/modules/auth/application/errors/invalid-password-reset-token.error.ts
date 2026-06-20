import { ApplicationError } from 'src/core/shared/errors/application.error';

export class InvalidPasswordResetTokenError extends ApplicationError {
  constructor() {
    super('Token de redefinição de senha inválido.', 401);
  }
}
