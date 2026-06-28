import { DomainError } from 'src/core/shared/errors/domain.error';

export class CouponAlreadyRedeemedError extends DomainError {
  constructor() {
    super('Este cupom já foi resgatado anteriormente.');
  }
}