import { ApplicationError } from 'src/core/shared/errors/application.error';

export class UserNotFoundError extends ApplicationError {
  constructor() {
    super('Usuário não encontrado.', 404);
  }
}
