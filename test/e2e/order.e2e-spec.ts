import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { cleanDatabase } from './db-helper';
import { PrismaService } from '../../src/core/providers/database/models/prisma.service';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

describe('Fluxo Crítico E2E', () => {
  let app: INestApplication;
  let customerToken: string;
  let adminToken: string;
  let staffToken: string;
  let storeId: string;
  let productId: string;
  let couponCode: string;
  let orderId: string;
  let customerUserId: string;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        errorHttpStatusCode: 422,
      }),
    );
    await app.init();

    prisma = app.get(PrismaService);
    await cleanDatabase(prisma);

    // ── Admin (criado direto via Prisma — não há admin para autorizar o /users/management) ──
    const bcrypt = await import('bcryptjs');
    const adminPwd = await bcrypt.hash('Admin@123', 8);
    await prisma.user.create({
      data: {
        name: 'Admin E2E',
        email: 'admin@e2e.com',
        password: adminPwd,
        role: 'ADMIN',
        status: 'ACTIVE',
      },
    });

    const adminLogin = await request(app.getHttpServer())
      .post('/auth/sign-in')
      .send({ email: 'admin@e2e.com', password: 'Admin@123' })
      .expect(200);
    adminToken = adminLogin.body.accessToken;

    // ── Staff ──
    await request(app.getHttpServer())
      .post('/users/management')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Staff E2E',
        email: 'staff@e2e.com',
        password: 'Staff@123',
        role: 'staff',
        profile: 'KITCHEN',
      })
      .expect(201);

    const staffLogin = await request(app.getHttpServer())
      .post('/auth/sign-in')
      .send({ email: 'staff@e2e.com', password: 'Staff@123' })
      .expect(200);
    staffToken = staffLogin.body.accessToken;

    // ── Loja (Admin) ──
    await request(app.getHttpServer())
      .post('/stores')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Loja E2E',
        address: {
          streetAndNumber: 'Rua Teste, 123',
          cep: '60000-000',
          neighborhood: 'Centro',
          city: 'Fortaleza',
        },
      })
      .expect(201);

    const store = await prisma.store.findFirst({ where: { name: 'Loja E2E' } });
    expect(store).not.toBeNull();
    storeId = store!.id;

    // ── Produto (Admin) ──
    await request(app.getHttpServer())
      .post('/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Produto E2E', price: 100 })
      .expect(201);

    const product = await prisma.product.findFirst({ where: { name: 'Produto E2E' } });
    expect(product).not.toBeNull();
    productId = product!.id;

    // ── Estoque (Admin) ──
    await request(app.getHttpServer())
      .post('/stocks')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ storeId, productId, quantity: 50 })
      .expect(201);

    // ── Cliente ──
    await request(app.getHttpServer())
      .post('/users')
      .send({
        name: 'Cliente',
        email: 'cliente@e2e.com',
        password: 'Senha@123',
        customerData: {
          cpf: '111.222.333-44',
          consent: true,
          consentAt: '2026-05-17T00:00:00.000Z',
        },
      })
      .expect(201);

    const custLogin = await request(app.getHttpServer())
      .post('/auth/sign-in')
      .send({ email: 'cliente@e2e.com', password: 'Senha@123' })
      .expect(200);
    customerToken = custLogin.body.accessToken;

    // customerUserId = User.id (sub do JWT) — é o mesmo userId do Customer
    const decoded = JSON.parse(
      Buffer.from(custLogin.body.accessToken.split('.')[1], 'base64').toString(),
    );
    customerUserId = decoded.sub;

    // Seed: cliente começa com 100 pontos
    await prisma.customer.update({
      where: { userId: customerUserId },
      data: { points: 100 },
    });

    // ── Resgate de cupom ──
    const redeemRes = await request(app.getHttpServer())
      .post('/loyalty/redeem')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ points: 20 })
      .expect(201);
    couponCode = redeemRes.body.loyalty.couponCode;
  });

  afterAll(async () => {
    await app.close();
  });

  it('T07 - Criar pedido válido', async () => {
    const res = await request(app.getHttpServer())
      .post('/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        storeId,
        customerId: customerUserId,
        channel: 'online',
        items: [{ productId, quantity: 2 }],
      })
      .expect(201);

    expect(res.body.order.status).toBe('pending');
    expect(res.body.order.totalAmount).toBe(200);
    orderId = res.body.order.id;
  });

  it('T08 - Pedido sem canal (422)', async () => {
    await request(app.getHttpServer())
      .post('/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        storeId,
        customerId: customerUserId,
        items: [{ productId, quantity: 1 }],
      })
      .expect(422);
  });

  it('T09 - Estoque insuficiente (409)', async () => {
    await request(app.getHttpServer())
      .post('/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        storeId,
        customerId: customerUserId,
        channel: 'online',
        items: [{ productId, quantity: 9999 }],
      })
      .expect(409);
  });

  it('T10 - Pagamento aprovado + pontos', async () => {
    // O mock de pagamento tem aprovação aleatória (50/50). Tentamos até 5x.
    const maxAttempts = 5;
    let approved = false;
    let lastOrderId: string | undefined;
    let pointsAfter = 0;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const created = await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          storeId,
          customerId: customerUserId,
          channel: 'online',
          items: [{ productId, quantity: 1 }],
        })
        .expect(201);
      lastOrderId = created.body.order.id;

      const patched = await request(app.getHttpServer())
        .patch(`/orders/${lastOrderId}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ confirmPayment: true });

      if (patched.status === 200) {
        approved = true;
        expect(patched.body.order.status).toBe('confirmed');
        break;
      }

      // 422 = pagamento recusado aleatoriamente — tenta de novo com novo pedido
      expect(patched.status).toBe(422);
    }

    expect(approved, 'Pagamento nunca foi aprovado após múltiplas tentativas').toBe(true);

    // Após aprovação, saldo = 100 - 20 (resgate inicial) + 10 (10% de 100) = 90
    const bal = await request(app.getHttpServer())
      .get('/loyalty/balance')
      .set('Authorization', `Bearer ${customerToken}`)
      .expect(200);
    pointsAfter = bal.body.loyalty.points;
    expect(pointsAfter).toBe(90);

    orderId = lastOrderId!;
  });

  it('T11 - Pagamento recusado (422)', async () => {
    const o = await request(app.getHttpServer())
      .post('/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        storeId,
        customerId: customerUserId,
        channel: 'online',
        items: [{ productId, quantity: 1 }],
      })
      .expect(201);

    await request(app.getHttpServer())
      .patch(`/orders/${o.body.order.id}`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ confirmPayment: true, simulatePaymentFailure: true })
      .expect(422);
  });

  it('T12 - Atualizar status (staff)', async () => {
    await request(app.getHttpServer())
      .patch(`/orders/${orderId}`)
      .set('Authorization', `Bearer ${staffToken}`)
      .send({ status: 'shipped' })
      .expect(200);

    const updated = await request(app.getHttpServer())
      .get(`/orders/${orderId}`)
      .set('Authorization', `Bearer ${staffToken}`)
      .expect(200);
    expect(updated.body.order.status).toBe('shipped');
  });

  it('T13 - Cancelar pedido (cliente)', async () => {
    const o = await request(app.getHttpServer())
      .post('/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        storeId,
        customerId: customerUserId,
        channel: 'online',
        items: [{ productId, quantity: 1 }],
      })
      .expect(201);

    await request(app.getHttpServer())
      .delete(`/orders/${o.body.order.id}`)
      .set('Authorization', `Bearer ${customerToken}`)
      .expect(204);
  });

  it('T14 - Consultar saldo fidelidade', async () => {
    const res = await request(app.getHttpServer())
      .get('/loyalty/balance')
      .set('Authorization', `Bearer ${customerToken}`)
      .expect(200);
    expect(res.body.loyalty.points).toBeDefined();
  });

  it('T15 - Resgatar pontos gera novo cupom', async () => {
    const res = await request(app.getHttpServer())
      .post('/loyalty/redeem')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ points: 20 })
      .expect(201);
    expect(res.body.loyalty.couponCode).toBeDefined();
    expect(res.body.loyalty.couponCode.length).toBeGreaterThan(0);
    expect(res.body.loyalty.remainingPoints).toBeLessThan(90);
  });

  it('T16 - Resgate sem consentimento (403)', async () => {
    // Remove consentimento via Prisma
    await prisma.customer.update({
      where: { userId: customerUserId },
      data: { consent: false },
    });

    await request(app.getHttpServer())
      .post('/loyalty/redeem')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ points: 10 })
      .expect(403);

    // Restaura consentimento
    await prisma.customer.update({
      where: { userId: customerUserId },
      data: { consent: true },
    });
  });

  it('T17 - Criar pedido com cupom válido', async () => {
    const res = await request(app.getHttpServer())
      .post('/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        storeId,
        customerId: customerUserId,
        channel: 'online',
        items: [{ productId, quantity: 1 }],
        couponCode,
      })
      .expect(201);
    expect(res.body.order.discount).toBeGreaterThan(0);
    expect(res.body.order.totalAmount).toBe(90);
  });

  it('T18 - Cupom inválido (400)', async () => {
    await request(app.getHttpServer())
      .post('/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        storeId,
        customerId: customerUserId,
        channel: 'online',
        items: [{ productId, quantity: 1 }],
        couponCode: 'INVALIDO',
      })
      .expect(400);
  });

  it('T19 - Reutilizar cupom já usado (400)', async () => {
    await request(app.getHttpServer())
      .post('/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        storeId,
        customerId: customerUserId,
        channel: 'online',
        items: [{ productId, quantity: 1 }],
        couponCode,
      })
      .expect(400);
  });

  it('T20 - Logs de auditoria existem', async () => {
    const logs = await prisma.auditLog.findMany();
    const actions = logs.map((l) => l.action);
    expect(actions).toContain('ORDER_CREATED');
    expect(actions).toContain('PAYMENT_APPROVED');
    expect(actions).toContain('PAYMENT_FAILED');
    expect(actions).toContain('ORDER_STATUS_UPDATED');
  });
});