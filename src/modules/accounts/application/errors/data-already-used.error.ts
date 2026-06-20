import { ApplicationError } from 'src/core/shared/errors/application.error';

export class DataAlreadyUsedError extends ApplicationError {
  constructor() {
    super('Os dados fornecidos já estão em uso.', 409);
  }
}
