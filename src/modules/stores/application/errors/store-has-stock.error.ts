import { ApplicationError } from 'src/core/shared/errors/application.error';

export class StoreHasStockError extends ApplicationError {
  constructor() {
    super('Não é possível excluir uma loja que possui itens em estoque.', 400);
  }
}
