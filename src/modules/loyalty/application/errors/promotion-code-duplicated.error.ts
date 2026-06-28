import { DomainError } from 'src/core/shared/errors/domain.error';

export class PromotionCodeAlreadyExistsError extends DomainError {
  constructor(code: string) {
    super(`O código promocional '${code}' já existe.`);
  }
}