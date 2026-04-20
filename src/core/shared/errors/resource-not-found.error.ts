import { ApplicationError } from './application.error';

export class ResourceNotFoundError extends ApplicationError {
  constructor(resourceName: string = 'Resource') {
    super(`${resourceName} not found.`);
  }
}
