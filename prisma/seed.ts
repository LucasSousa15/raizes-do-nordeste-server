import 'dotenv/config';

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is required to run the seed.');
}

const pool = new Pool({ connectionString });
const prisma = new PrismaClient({
  adapter: new PrismaPg(pool),
});

const stores = [
  {
    id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    name: 'Raizes do Nordeste - Centro',
    address: 'Rua das Palmeiras, 100 - Centro',
  },
  {
    id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
    name: 'Raizes do Nordeste - Praia',
    address: 'Avenida Beira Mar, 250 - Praia',
  },
];

const products = [
  {
    id: '11111111-1111-4111-8111-111111111111',
    name: 'Acaraje',
    description: 'Bolinho de feijao-fradinho frito no azeite de dende, servido com vatapa',
    price: 8.5,
    globalQuantity: 120,
    storeQuantities: [50, 70],
  },
  {
    id: '22222222-2222-4222-8222-222222222222',
    name: 'Vatapa',
    description: 'Creme nordestino com pao, leite de coco, amendoim, castanha e camarao',
    price: 12,
    globalQuantity: 80,
    storeQuantities: [35, 45],
  },
  {
    id: '33333333-3333-4333-8333-333333333333',
    name: 'Baiao de Dois',
    description: 'Arroz com feijao verde, queijo coalho e carne de sol',
    price: 18.9,
    globalQuantity: 60,
    storeQuantities: [25, 35],
  },
  {
    id: '44444444-4444-4444-8444-444444444444',
    name: 'Carne de Sol com Macaxeira',
    description: 'Carne de sol acebolada acompanhada de macaxeira cozida',
    price: 32.5,
    globalQuantity: 35,
    storeQuantities: [12, 23],
  },
  {
    id: '55555555-5555-4555-8555-555555555555',
    name: 'Bolo de Rolo',
    description: 'Massa fina enrolada com recheio de goiabada',
    price: 9.9,
    globalQuantity: 90,
    storeQuantities: [40, 50],
  },
  {
    id: '66666666-6666-4666-8666-666666666666',
    name: 'Cuscuz Nordestino',
    description: 'Cuscuz de milho servido com manteiga de garrafa',
    price: 7.5,
    globalQuantity: 140,
    storeQuantities: [75, 65],
  },
  {
    id: '77777777-7777-4777-8777-777777777777',
    name: 'Tapioca de Queijo Coalho',
    description: 'Tapioca recheada com queijo coalho derretido',
    price: 10.9,
    globalQuantity: 70,
    storeQuantities: [28, 42],
  },
  {
    id: '88888888-8888-4888-8888-888888888888',
    name: 'Moqueca de Peixe',
    description: 'Peixe cozido com leite de coco, pimentoes, tomate e coentro',
    price: 38.9,
    globalQuantity: 25,
    storeQuantities: [10, 15],
  },
  {
    id: '99999999-9999-4999-8999-999999999999',
    name: 'Escondidinho de Carne Seca',
    description: 'Pure de macaxeira recheado com carne seca desfiada',
    price: 24.9,
    globalQuantity: 45,
    storeQuantities: [18, 27],
  },
  {
    id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    name: 'Cartola',
    description: 'Banana frita com queijo, acucar e canela',
    price: 11.9,
    globalQuantity: 65,
    storeQuantities: [32, 33],
  },
];

async function main() {
  for (const store of stores) {
    await prisma.store.upsert({
      where: { id: store.id },
      update: {
        name: store.name,
        address: store.address,
      },
      create: store,
    });
  }

  for (const product of products) {
    await prisma.product.upsert({
      where: { id: product.id },
      update: {
        name: product.name,
        description: product.description,
        price: product.price,
      },
      create: {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
      },
    });

    await prisma.globalStock.upsert({
      where: { productId: product.id },
      update: {
        quantity: product.globalQuantity,
      },
      create: {
        productId: product.id,
        quantity: product.globalQuantity,
      },
    });

    for (const [storeIndex, quantity] of product.storeQuantities.entries()) {
      const store = stores[storeIndex];

      await prisma.storeStock.upsert({
        where: {
          storeId_productId: {
            storeId: store.id,
            productId: product.id,
          },
        },
        update: {
          quantity,
        },
        create: {
          storeId: store.id,
          productId: product.id,
          quantity,
        },
      });
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });
