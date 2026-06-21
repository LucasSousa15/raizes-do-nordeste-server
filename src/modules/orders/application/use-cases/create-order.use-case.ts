import { Injectable } from '@nestjs/common';
import { OrderRepository } from '../../domain/repositories/order.repositorie';
import { Order } from '../../domain/entities/order.entitie';
import { CreateOrderReq, IOrderItem, OrderStatus } from '../../domain/@types/order';
import { UsersRepository } from 'src/modules/accounts/domain/repositories/users.repositories';
import { UserRole } from 'src/modules/accounts/domain/@types/users';
import { CustomersOnlyError } from '../errors/customers-only.error';
import { ProductRepository } from 'src/modules/products/domain/repositories/product.repositorie';
import { StoreStockRepository } from 'src/modules/stocks/domain/repositories/store-stock.repositorie';
import { InsufficientStockError } from 'src/modules/stocks/application/errors/insufficient-stock.error';
import { ProductNotFoundError } from 'src/modules/products/application/errors/product-not-found.error';

@Injectable()
export class CreateOrderUseCase {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly productRepository: ProductRepository,
    private readonly storeStockRepository: StoreStockRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  async execute(data: CreateOrderReq): Promise<Order> {
    if (!data.channel) {
      throw new Error('Channel is required');
    }

    const user = await this.usersRepository.findById(data.customerId);
    const isCustomer = user?.role === UserRole.CUSTOMER;

    if (!isCustomer || !user.customerData) {
      throw new CustomersOnlyError();
    }

    const items: IOrderItem[] = [];

    for (const item of data.items || []) {
      const product = await this.productRepository.findById(item.productId);
      if (!product) {
        throw new ProductNotFoundError();
      }

      const stock = await this.storeStockRepository.findByStoreAndProduct(data.storeId, item.productId);
      if (!stock || stock.quantity < item.quantity) {
        throw new InsufficientStockError();
      }

      items.push({
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
      });
    }

    const totalAmount = items.reduce((sum, it) => sum + it.price * it.quantity, 0);

    const toCreate = {
      storeId: data.storeId,
      items,
      customerId: data.customerId,
      channel: data.channel,
      totalAmount,
      status: OrderStatus.PENDING,
    };

    const created = await this.orderRepository.createOrder(toCreate);

    for (const item of items) {
      await this.storeStockRepository.adjustQuantity(data.storeId, item.productId, -item.quantity);
    }

    return created;
  }
}
