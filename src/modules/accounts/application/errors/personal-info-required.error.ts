import { ApplicationError } from 'src/core/shared/errors/application.error';

export class PersonalInfoRequiredError extends ApplicationError {
  constructor() {
    super('Personal information is required for this user role.', 409);
  }
}
