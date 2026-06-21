import { Injectable } from '@nestjs/common';
import { PaymentStatus as PrismaPaymentStatus } from '@prisma/client';
import { PrismaService } from 'src/core/providers/database/models/prisma.service';
import { CreatePaymentReq, IPayment, PaymentProvider, PaymentStatus } from 'src/modules/payments/domain/@types/payment';
import { PaymentRepository } from 'src/modules/payments/domain/repositories/payment.repositorie';

const statusDomainToPrisma: Record<PaymentStatus, PrismaPaymentStatus> = {
  [PaymentStatus.PENDING]: 'PENDING',
  [PaymentStatus.SUCCESS]: 'SUCCESS',
  [PaymentStatus.FAILED]: 'FAILED',
  [PaymentStatus.CANCELLED]: 'CANCELLED',
};

const statusPrismaToDomain: Record<PrismaPaymentStatus, PaymentStatus> = {
  PENDING: PaymentStatus.PENDING,
  SUCCESS: PaymentStatus.SUCCESS,
  FAILED: PaymentStatus.FAILED,
  CANCELLED: PaymentStatus.CANCELLED,
};

@Injectable()
export class PrismaPaymentRepository implements PaymentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreatePaymentReq): Promise<IPayment> {
    const payment = await this.prisma.payment.create({
      data: {
        orderId: data.orderId,
        provider: data.provider,
        status: statusDomainToPrisma[data.status],
        requestPayload: data.requestPayload as any,
        responsePayload: data.responsePayload as any,
      },
    });

    return this.toDomain(payment);
  }

  async findById(id: string): Promise<IPayment | null> {
    const payment = await this.prisma.payment.findUnique({ where: { id } });
    return payment ? this.toDomain(payment) : null;
  }

  async findByOrderId(orderId: string): Promise<IPayment[]> {
    const payments = await this.prisma.payment.findMany({
      where: { orderId },
      orderBy: { createdAt: 'desc' },
    });

    return payments.map((payment) => this.toDomain(payment));
  }

  private toDomain(payment: {
    id: string;
    orderId: string;
    provider: string;
    status: PrismaPaymentStatus;
    requestPayload: unknown;
    responsePayload: unknown;
    createdAt: Date;
    updatedAt: Date;
  }): IPayment {
    return {
      id: payment.id,
      orderId: payment.orderId,
      provider: payment.provider as PaymentProvider,
      status: statusPrismaToDomain[payment.status],
      requestPayload: payment.requestPayload as Record<string, unknown> | null,
      responsePayload: payment.responsePayload as Record<string, unknown> | null,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
    };
  }
}
