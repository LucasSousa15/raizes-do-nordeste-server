import { Injectable, BadRequestException } from '@nestjs/common';
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
import { AuditService } from 'src/modules/audit/application/services/audit.service';
import { CustomerPromotionRepository } from 'src/modules/promotions/domain/repositories/customer-promotion.repositorie';

@Injectable()
export class CreateOrderUseCase {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly productRepository: ProductRepository,
    private readonly storeStockRepository: StoreStockRepository,
    private readonly usersRepository: UsersRepository,
    private readonly customerPromotionRepo: CustomerPromotionRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(data: CreateOrderReq): Promise<Order> {
    if (!data.channel) throw new Error('Channel is required');

    const user = await this.usersRepository.findById(data.customerId);
    if (!user || user.role !== UserRole.CUSTOMER || !user.customerData) {
      throw new CustomersOnlyError();
    }

    const items: IOrderItem[] = [];
    for (const item of data.items || []) {
      const product = await this.productRepository.findById(item.productId);
      if (!product) throw new ProductNotFoundError();
      const stock = await this.storeStockRepository.findByStoreAndProduct(data.storeId, item.productId);
      if (!stock || stock.quantity < item.quantity) throw new InsufficientStockError();
      items.push({ productId: item.productId, quantity: item.quantity, price: product.price });
    }

    const subtotal = items.reduce((sum, it) => sum + it.price * it.quantity, 0);
    let discountAmount = 0;
    let couponCode: string | undefined;

    if (data.couponCode) {
      const customerPromo = await this.customerPromotionRepo.findValidByUserAndCode(
        data.customerId,
        data.couponCode,
      );
      if (!customerPromo || !customerPromo.promotion) {
        throw new BadRequestException('Cupom inválido, expirado ou não pertence a este cliente');
      }
      discountAmount = subtotal * customerPromo.promotion.discount;
      couponCode = data.couponCode;
    }

    const totalAmount = subtotal - discountAmount;

    const created = await this.orderRepository.createOrder({
      storeId: data.storeId,
      items,
      customerId: data.customerId,
      channel: data.channel,
      totalAmount,
      discount: discountAmount,
      couponCode,
      status: OrderStatus.PENDING,
    });

    for (const item of items) {
      await this.storeStockRepository.adjustQuantity(data.storeId, item.productId, -item.quantity);
    }

    if (couponCode) {
      const promo = await this.customerPromotionRepo.findValidByUserAndCode(data.customerId, couponCode);
      if (promo) await this.customerPromotionRepo.markAsUsed(promo.id);
    }

    await this.auditService.logAction(data.customerId, 'ORDER_CREATED', {
      orderId: created.id,
      totalAmount,
      discount: discountAmount,
      channel: data.channel,
      couponCode,
    });

    return created;
  }
}