import { beforeEach, describe, expect, it } from 'vitest';

import { UserRole, UserStatus } from 'src/modules/accounts/domain/@types/users';
import { InMemoryUsersRepository } from 'test/accounts/repositories/in-memory.users.repository';
import { InMemoryPromotionRepository } from 'test/promotions/repositories/in-memorie-promotions.repositorie';
import { InMemoryCustomerPromotionRepository } from 'test/promotions/repositories/in-memorie-customer-promotions.repositorie';
import { InMemoryAuditLogRepository } from 'test/audit/repositories/in-memory.audit-log.repository';
import { AuditService } from 'src/modules/audit/application/services/audit.service';
import { GetLoyaltyBalanceUseCase } from 'src/modules/loyalty/application/use-cases/get-loyalty-balance.use-case';
import { RedeemLoyaltyPointsUseCase } from 'src/modules/loyalty/application/use-cases/redeem-loyalty-points.use-case';
import { ConsentRequiredError } from 'src/modules/loyalty/application/errors/consent-required.error';
import { InsufficientPointsError } from 'src/modules/loyalty/application/errors/insufficient-points.error';

describe('Loyalty use cases', () => {
  let usersRepo: InMemoryUsersRepository;
  let promotionsRepo: InMemoryPromotionRepository;
  let customerPromotionsRepo: InMemoryCustomerPromotionRepository;
  let auditRepo: InMemoryAuditLogRepository;

  beforeEach(() => {
    usersRepo = new InMemoryUsersRepository();
    promotionsRepo = new InMemoryPromotionRepository();
    customerPromotionsRepo = new InMemoryCustomerPromotionRepository();
    auditRepo = new InMemoryAuditLogRepository();
  });

  it('returns loyalty balance for customer', async () => {
    await usersRepo.create({
      id: 'u1',
      name: 'Cliente',
      email: 'cliente@example.com',
      password: 'pass',
      role: UserRole.CUSTOMER,
      status: UserStatus.ACTIVE,
      customerData: {
        id: 'c1',
        cpf: '123',
        consent: true,
        consentAt: new Date(),
        points: 42,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    } as any);

    const sut = new GetLoyaltyBalanceUseCase(usersRepo);
    const result = await sut.execute('u1');

    expect(result.points).toBe(42);
    expect(result.consent).toBe(true);
  });

  it('redeems points when customer has consent and enough balance', async () => {
    await usersRepo.create({
      id: 'u1',
      name: 'Cliente',
      email: 'cliente@example.com',
      password: 'pass',
      role: UserRole.CUSTOMER,
      status: UserStatus.ACTIVE,
      customerData: {
        id: 'c1',
        cpf: '123',
        consent: true,
        consentAt: new Date(),
        points: 50,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    } as any);

    const sut = new RedeemLoyaltyPointsUseCase(
      usersRepo,
      promotionsRepo,
      customerPromotionsRepo,
      new AuditService(auditRepo),
    );
    const result = await sut.execute({ userId: 'u1', points: 20 });

    expect(result.redeemedPoints).toBe(20);
    expect(result.remainingPoints).toBe(30);

    const updated = await usersRepo.findById('u1');
    expect(updated?.customerData?.points).toBe(30);
  });

  it('throws when consent is missing', async () => {
    await usersRepo.create({
      id: 'u1',
      name: 'Cliente',
      email: 'cliente@example.com',
      password: 'pass',
      role: UserRole.CUSTOMER,
      status: UserStatus.ACTIVE,
      customerData: {
        id: 'c1',
        cpf: '123',
        consent: false,
        consentAt: null,
        points: 50,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    } as any);

    const sut = new RedeemLoyaltyPointsUseCase(
      usersRepo,
      promotionsRepo,
      customerPromotionsRepo,
      new AuditService(auditRepo),
    );

    await expect(
      sut.execute({ userId: 'u1', points: 10 }),
    ).rejects.toBeInstanceOf(ConsentRequiredError);
  });

  it('throws when points are insufficient', async () => {
    await usersRepo.create({
      id: 'u1',
      name: 'Cliente',
      email: 'cliente@example.com',
      password: 'pass',
      role: UserRole.CUSTOMER,
      status: UserStatus.ACTIVE,
      customerData: {
        id: 'c1',
        cpf: '123',
        consent: true,
        consentAt: new Date(),
        points: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    } as any);

    const sut = new RedeemLoyaltyPointsUseCase(
      usersRepo,
      promotionsRepo,
      customerPromotionsRepo,
      new AuditService(auditRepo),
    );

    await expect(
      sut.execute({ userId: 'u1', points: 10 }),
    ).rejects.toBeInstanceOf(InsufficientPointsError);
  });
});
