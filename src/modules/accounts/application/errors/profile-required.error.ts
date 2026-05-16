import { ApplicationError } from 'src/core/shared/errors/application.error';

export class ProfileRequiredError extends ApplicationError {
  constructor() {
    super('Profile is required for this user role.', 409);
  }
}
