import { ApplicationError } from 'src/core/shared/errors/application.error';

export class UserNotFoundError extends ApplicationError {
  constructor() {
    super('User not found.', 404);
  }
}
