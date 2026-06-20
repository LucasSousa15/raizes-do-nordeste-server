import { ApplicationError } from 'src/core/shared/errors/application.error';

export class PersonalInfoRequiredError extends ApplicationError {
  constructor() {
    super('Informações pessoais são obrigatórias para este tipo de usuário.', 409);
  }
}
