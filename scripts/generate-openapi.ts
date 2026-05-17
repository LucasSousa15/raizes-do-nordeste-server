import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { writeFileSync, mkdirSync } from 'fs';

async function run(){
  const app = await NestFactory.create(AppModule, { logger: false });

  const config = new DocumentBuilder()
    .setTitle('Raízes do Nordeste API')
    .setDescription('API usando NestJS, Prisma')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  try { mkdirSync('docs', { recursive: true }); } catch(e){}
  writeFileSync('docs/openapi.json', JSON.stringify(document, null, 2));
  console.log('Wrote docs/openapi.json');
  await app.close();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
