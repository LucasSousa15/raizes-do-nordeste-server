import { ApplicationError } from 'src/core/shared/errors/application.error';

export class ProfileRequiredError extends ApplicationError {
  constructor() {
    super('Perfil é obrigatório para este tipo de usuário.', 409);
  }
}
