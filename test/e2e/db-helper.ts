import { PrismaClient } from '@prisma/client';

export async function cleanDatabase(prisma: PrismaClient) {
  await prisma.auditLog.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.storeStock.deleteMany();
  await prisma.globalStock.deleteMany();
  await prisma.customerPromotion.deleteMany();
  await prisma.promotion.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.passwordReset.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();
  await prisma.store.deleteMany();
  await prisma.product.deleteMany();
}
