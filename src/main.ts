import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { env } from './core/config/env';
import { GlobalExceptionFilter } from './core/shared/errors/global-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalFilters(new GlobalExceptionFilter());

  app.useGlobalPipes(new ValidationPipe(
    {
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }
  ));

    const config = new DocumentBuilder()
    .setTitle('Raízes do Nordeste API')
    .setDescription('API usando NestJS, Prisma')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);


  await app.listen(env.PORT ?? 3000);

  console.log(`Aplicação rodando na porta http://localhost:${env.PORT ?? 3000}`);
  console.log(`Documentação disponível em http://localhost:${env.PORT ?? 3000}/docs`);
}
bootstrap();
