import { ApplicationError } from 'src/core/shared/errors/application.error';

export class InvalidCredentialsError extends ApplicationError {
  constructor() {
    super('Invalid credentials', 401);
  }
}
