import { ApplicationError } from 'src/core/shared/errors/application.error';

export class StoreAddressUnavailableError extends ApplicationError {
  constructor() {
    super('Já existe uma loja cadastrada com esse endereço.', 409);
  }
}
