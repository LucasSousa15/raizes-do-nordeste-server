import { ApplicationError } from 'src/core/shared/errors/application.error';

export class PaymentNotApprovedError extends ApplicationError {
  constructor() {
    super('Pagamento não aprovado.', 422);
  }
}
