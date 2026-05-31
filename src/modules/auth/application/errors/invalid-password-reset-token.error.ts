import { ApplicationError } from 'src/core/shared/errors/application.error';

export class InvalidPasswordResetTokenError extends ApplicationError {
  constructor() {
    super('Invalid password reset token', 401);
  }
}
