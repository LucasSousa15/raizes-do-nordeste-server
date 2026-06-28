import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { cleanDatabase } from './db-helper';
import { PrismaService } from '../../src/core/providers/database/models/prisma.service';
import { ZodValidationPipe } from '../../src/core/pipes/zod-validation-pipe';
import { z } from 'zod';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

describe('Auth E2E', () => {
  let app: INestApplication;
  let customerToken: string;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ZodValidationPipe(z.any()));
    await app.init();

    prisma = app.get(PrismaService);
    await cleanDatabase(prisma);
  });

  afterAll(async () => {
    await app.close();
  });

  it('T03 - Cadastro de cliente válido', async () => {
    const res = await request(app.getHttpServer())
      .post('/users')
      .send({
        name: 'Cliente E2E',
        email: 'cliente@e2e.com',
        password: 'Senha@123',
        role: 'customer',
        customerData: {
          cpf: '123.456.789-00',
          consent: true,
          consentAt: '2026-05-17T00:00:00.000Z',
          points: 0,
        },
      })
      .expect(201);

    expect(res.body.user.email).toBe('cliente@e2e.com');
  });

  it('T01 - Login válido', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/sign-in')
      .send({ email: 'cliente@e2e.com', password: 'Senha@123' })
      .expect(200);
    expect(res.body.accessToken).toBeDefined();
    customerToken = res.body.accessToken;
  });

  it('T02 - Login senha inválida', async () => {
    await request(app.getHttpServer())
      .post('/auth/sign-in')
      .send({ email: 'cliente@e2e.com', password: 'senhaerrada' })
      .expect(401);
  });

  it('T04 - Acesso sem token (401)', async () => {
    await request(app.getHttpServer()).get('/orders').expect(401);
  });

  it('T05 - Cliente acessa rota admin (403)', async () => {
    await request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${customerToken}`)
      .expect(403);
  });
});