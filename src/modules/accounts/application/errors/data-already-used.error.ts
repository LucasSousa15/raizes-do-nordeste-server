import { ApplicationError } from 'src/core/shared/errors/application.error';

export class DataAlreadyUsedError extends ApplicationError {
  constructor() {
    super('Data provided is already in use.', 409);
  }
}
