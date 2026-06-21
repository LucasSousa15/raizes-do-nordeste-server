import { Module } from '@nestjs/common';
import { MockPaymentService } from './application/services/mock-payment.service';
import { PaymentRepository } from './domain/repositories/payment.repositorie';
import { PrismaPaymentRepository } from './infra/database/prisma/repositories/prisma-payment.repositorie';

@Module({
  providers: [
    MockPaymentService,
    {
      provide: PaymentRepository,
      useClass: PrismaPaymentRepository,
    },
  ],
  exports: [MockPaymentService, PaymentRepository],
})
export class PaymentsModule {}
