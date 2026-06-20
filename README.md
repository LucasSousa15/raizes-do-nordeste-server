![Brasil](https://img.shields.io/badge/Brasil-008C45?style=for-the-badge&logo=github&logoColor=ffffff&labelColor=FFCC29)

# Raizes do Nordeste - Backend

Este repositorio e o backend do meu projeto **Raizes do Nordeste**, desenvolvido para a atividade pratica de **Projeto Multidisciplinar - Trilha Back-End 2026**.

A ideia do sistema e atender uma rede de lanchonetes em expansao, com usuarios, autenticacao, perfis de acesso, clientes, unidades, produtos, estoque, pedidos por canal, pagamento mock e fidelizacao. Nem tudo esta finalizado ainda, entao este README tambem funciona como uma checklist honesta do que ja implementei e do que ainda falta fechar para a entrega.

> Observacao pessoal: como o repositorio e publico, nao subir `.env`, senhas, tokens ou credenciais reais.

---

## Stack

- [x] NestJS
- [x] TypeScript
- [x] Prisma ORM
- [x] PostgreSQL
- [x] JWT
- [x] Swagger/OpenAPI
- [x] Vitest

---

## Como rodar o projeto

1. Instalar dependencias:

```bash
npm install
```

2. Criar o arquivo `.env` na raiz:

```env
NODE_ENV=development
PORT=3000
DATABASE_URL="postgresql://usuario:senha@localhost:5432/raizes_do_nordeste"
JWT_SECRET="troque-este-segredo"
JWT_EXPIRES_IN="1h"
SALT_ROUNDS=10
```

3. Rodar as migrations:

```bash
npx prisma migrate deploy
```

Ou, em desenvolvimento:

```bash
npx prisma migrate dev
```

4. Iniciar a API:

```bash
npm run start:dev
```

5. Acessar:

```text
API: http://localhost:3000
Swagger: http://localhost:3000/docs
```

---

## Scripts

```bash
npm run start:dev   # iniciar em desenvolvimento
npm run build       # compilar
npm run start:prod  # rodar build
npm run test        # testes
npm run test:cov    # cobertura
npm run test:e2e    # testes e2e
npm run lint        # eslint
npm run format      # prettier
```

---

## Checklist geral do roteiro

### Entrega tecnica

- [x] Projeto NestJS organizado
- [x] Banco com Prisma
- [x] Migrations presentes
- [x] API executavel localmente
- [x] Swagger configurado em `/docs`
- [x] Arquivo OpenAPI em `docs/openapi.json`
- [ ] Criar `.env.example`
- [ ] Criar DER em `docs/DER.png` ou `docs/DER.pdf`
- [ ] Criar colecao Postman/Insomnia
- [ ] Criar plano de testes em `docs/test_plan.md`
- [ ] Preparar PDF final seguindo o roteiro/ABNT

### Arquitetura

- [x] Separacao por modulos
- [x] Camada de dominio
- [x] Camada de aplicacao com casos de uso
- [x] Camada de infraestrutura com Prisma, controllers, DTOs e guards
- [x] Camada HTTP/API
- [x] Repositorios com contratos no dominio
- [x] Mappers entre Prisma e dominio

### Seguranca e LGPD

- [x] Senha com hash
- [x] Login com JWT
- [x] Refresh token
- [x] Guards de autenticacao
- [x] Permissoes por perfil/role
- [x] View model sem retornar senha
- [x] Consentimento do cliente modelado
- [x] CPF modelado como dado de cliente
- [ ] Documentar finalidade/base legal dos dados pessoais
- [ ] Registrar auditoria/logs de acoes sensiveis
- [ ] Definir estrategia de retencao, exclusao ou anonimizacao
- [ ] Registrar globalmente o filtro de erro padronizado

### Testes

- [x] Testes de criacao de usuario
- [x] Testes de busca de usuario
- [x] Testes de atualizacao de usuario
- [x] Testes de exclusao de usuario
- [x] Testes de login
- [x] Testes de refresh token
- [x] Testes de reset de senha
- [x] Testes de view model
- [ ] Testes e2e completos do fluxo principal
- [ ] Pelo menos 10 cenarios documentados no plano de testes
- [ ] Evidenciar cenarios positivos e negativos na colecao Postman/Insomnia

---

## O que ja implementei

### Auth

- [x] `POST /auth/sign-in`
- [x] `POST /auth/refresh-token`
- [x] `POST /auth/password-reset`
- [x] `POST /auth/reset-password`
- [x] `JwtAuthGuard`
- [x] `JwtRefreshGuard`
- [x] `PermissionGuard`
- [x] `JwtStrategy`
- [x] `JwtRefreshStrategy`

### Users

- [x] `POST /users` para cadastro publico de cliente
- [x] `POST /users/management` para criacao administrativa
- [x] `GET /users`
- [x] `GET /users/:id`
- [x] `PATCH /users/:id`
- [x] `DELETE /users/:id`
- [x] Controle de acesso por permissao em rotas protegidas
- [x] Cadastro de cliente com dados complementares

### Repositorio de usuarios

- [x] `create`
- [x] `findByEmail`
- [x] `findById`
- [x] `findMany`
- [x] `findByStatus`
- [x] `update`
- [x] `delete`

---

## Modelo de dados atual

O `prisma/schema.prisma` ja possui as principais entidades pedidas no roteiro:

- [x] `User`
- [x] `Customer`
- [x] `RefreshToken`
- [x] `PasswordReset`
- [x] `Store`
- [x] `Product`
- [x] `Order`
- [x] `OrderItem`
- [x] `StoreStock`
- [x] `GlobalStock`
- [x] `Payment`

Enums ja modelados:

- [x] `Role`
- [x] `User_status`
- [x] `Profile`
- [x] `Channel`
- [x] `OrderStatus`
- [x] `PaymentStatus`

Relacoes principais para usar no DER:

- [x] `User` 1:1 `Customer`
- [x] `User` 1:N `RefreshToken`
- [x] `User` 1:N `PasswordReset`
- [x] `Customer` 1:N `Order`
- [x] `Store` 1:N `Order`
- [x] `Store` 1:N `StoreStock`
- [x] `Product` 1:N `StoreStock`
- [x] `Product` 1:N `GlobalStock`
- [x] `Order` 1:N `OrderItem`
- [x] `Product` 1:N `OrderItem`
- [x] `Order` 1:N `Payment`

---

## Requisitos funcionais do roteiro

- [x] Cadastro de usuarios
- [x] Autenticacao/login
- [x] Perfis/roles
- [x] Autorizacao por permissao
- [x] Gestao de unidades da rede
- [ ] Cardapio por unidade
 - [x] CRUD/consulta de produtos
- [ ] Criacao de pedidos
- [ ] Atualizacao de status do pedido
- [ ] Cancelamento de pedido
- [ ] Controle de estoque por unidade
- [ ] Restricao de venda por estoque indisponivel
- [ ] Programa de fidelizacao completo
- [ ] Promocoes/campanhas
- [ ] Pagamento mock com retorno aprovado/recusado

---

## Multicanalidade

O roteiro pede que o pedido tenha o campo `canalPedido`, com valores como APP, TOTEM, BALCAO, PICKUP e WEB.

No meu modelo atual, isso esta representado pelo campo `Order.channel`:

```prisma
enum Channel {
  WEB
  APP
  TOTEM
  IN_STORE
  PICKUP
}
```

Checklist para fechar esse ponto:

- [x] Modelar canal no banco
- [x] Ter enum de canais
- [ ] Criar endpoints de pedido
- [ ] Exigir `canalPedido` ao criar pedido
- [ ] Mapear `canalPedido` para `Order.channel`
- [ ] Permitir filtro de pedidos por canal
- [ ] Avaliar renomear `IN_STORE` para `BALCAO` para ficar mais igual ao roteiro

---

## Fluxo critico escolhido

O fluxo mais alinhado ao roteiro e:

```text
Pedido -> Pagamento mock -> Atualizacao de status
```

Status atual:

- [x] Entidades do fluxo modeladas no Prisma
- [x] Pedido possui itens
- [x] Pedido possui status
- [x] Pedido possui canal
- [x] Pagamento possui status e payloads
- [ ] Caso de uso para criar pedido
- [ ] Validacao de estoque
- [ ] Registro de pagamento mock
- [ ] Simulacao de pagamento aprovado
- [ ] Simulacao de pagamento recusado
- [ ] Atualizacao automatica/manual do status do pedido
- [ ] Endpoints de pedidos
- [ ] Endpoints de pagamentos
- [ ] Testes do fluxo completo

---

## Endpoints atuais

### Auth

- [x] `POST /auth/sign-in` - autenticar usuario
- [x] `POST /auth/refresh-token` - renovar token
- [x] `POST /auth/password-reset` - criar token de reset
- [x] `POST /auth/reset-password` - redefinir senha

### Users

- [x] `POST /users` - cadastrar cliente
- [x] `POST /users/management` - criar usuario como administrador
- [x] `GET /users` - buscar/listar usuarios conforme filtros
- [x] `GET /users/:id` - buscar usuario por id
- [x] `PATCH /users/:id` - atualizar usuario
- [x] `DELETE /users/:id` - remover usuario

### Ainda faltam

- [x] `/stores`
 - [x] `/products`
- [x] `/stocks` (domínio, repositórios e casos de uso implementados; controllers/rotas pendentes)
- [ ] `/orders`
- [ ] `/payments`
- [ ] `/loyalty`
- [ ] `/promotions`

---

## Exemplos rapidos

Cadastro de cliente:

```json
{
  "name": "John Doe",
  "email": "johndoe@example.com",
  "password": "password123",
  "customerData": {
    "cpf": "123.456.789-00",
    "consent": true,
    "consentAt": "2026-05-31T13:30:00.000Z"
  }
}
```

Login:

```json
{
  "email": "johndoe@example.com",
  "password": "password123"
}
```

Pedido esperado no futuro:

```json
{
  "canalPedido": "TOTEM",
  "clienteId": "uuid-do-cliente",
  "unidadeId": "uuid-da-unidade",
  "itens": [
    {
      "produtoId": "uuid-do-produto",
      "quantidade": 2
    }
  ],
  "formaPagamento": "MOCK"
}
```

---

## Plano de testes que ainda preciso documentar

O roteiro pede pelo menos 10 cenarios, com positivos e negativos. Minha proposta:

- [ ] T01 - Cadastro de cliente valido
- [ ] T02 - Cadastro com e-mail repetido
- [ ] T03 - Login valido
- [ ] T04 - Login com senha invalida
- [ ] T05 - Refresh token valido
- [ ] T06 - Refresh token invalido
- [ ] T07 - Acessar rota protegida sem token
- [ ] T08 - Acessar rota sem permissao
- [ ] T09 - Atualizar usuario
- [ ] T10 - Deletar usuario
- [ ] T11 - Criar pedido com canal
- [ ] T12 - Criar pedido sem canal
- [ ] T13 - Pedido com estoque insuficiente
- [ ] T14 - Pagamento mock aprovado
- [ ] T15 - Pagamento mock recusado

---

## Pendencias principais antes da entrega

- [ ] Criar `.env.example`
- [x] Implementar modulo de unidades
- [x] Implementar modulo de produtos/cardapio
- [x] Implementar modulo de estoque (domínio, repositórios e use-cases implementados; controllers/rotas pendentes)
- [ ] Implementar modulo de pedidos
- [ ] Implementar pagamento mock
- [ ] Implementar fidelizacao de forma simples
- [ ] Implementar logs/auditoria
- [ ] Padronizar erro global conforme roteiro
- [ ] Criar DER
- [ ] Criar colecao Postman/Insomnia
- [ ] Criar plano de testes
- [ ] Atualizar `docs/openapi.json` depois dos novos endpoints
- [ ] Preparar PDF final com requisitos, diagramas, endpoints, LGPD, testes e conclusao

---

## Conclusao parcial

A parte de **usuarios, autenticacao, roles/permissoes, persistencia com Prisma, Swagger e testes unitarios** ja esta andando bem. O banco tambem ja foi modelado pensando no dominio completo do roteiro.

O ponto mais importante que ainda falta para o MVP ficar completo e implementar o fluxo **Pedido -> Pagamento mock -> Atualizacao de status**, porque ele fecha o requisito principal de negocio e permite demonstrar multicanalidade, estoque, pagamento, validacoes e testes negativos.
