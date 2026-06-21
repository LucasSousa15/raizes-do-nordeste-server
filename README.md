![Brasil](https://img.shields.io/badge/Brasil-008C45?style=for-the-badge&logo=github&logoColor=ffffff&labelColor=FFCC29)

# Raizes do Nordeste - Backend

Este repositorio e o backend do meu projeto **Raizes do Nordeste**, desenvolvido para a atividade pratica de **Projeto Multidisciplinar - Trilha Back-End 2026**.

A ideia e simular o backend de uma rede de lanchonetes nordestinas em expansao, com usuarios, autenticacao, perfis de acesso, unidades, produtos, estoque por loja, cardapio por unidade, pedidos multicanal, pagamento mock e fidelizacao. Nem tudo esta 100% fechado ainda — este README funciona como uma checklist honesta do que eu ja implementei e do que ainda falta para a entrega.


---

## Stack que estou usando

- NestJS
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT (access + refresh)
- Swagger/OpenAPI
- Vitest

---

## Como rodar o projeto

1. Instalar dependencias:

```bash
npm install
```

2. Copiar variaveis de ambiente:

```bash
cp .env.example .env
```

Edite o `.env` com suas credenciais locais do PostgreSQL.

3. Rodar migrations:

```bash
npx prisma migrate deploy
```

Ou, em desenvolvimento:

```bash
npx prisma migrate dev
```

4. (Recomendado) Popular o banco com dados de exemplo:

```bash
npm run db:seed
```

O seed cria 2 unidades, 10 produtos tipicos nordestinos e estoque por loja, com IDs fixos para facilitar testes.

5. Iniciar a API:

```bash
npm run start:dev
```

6. Acessar:

```text
API:     http://localhost:3000
Swagger: http://localhost:3000/docs
DER:     docs/DER.png
Testes:  docs/test_plan.md
Postman: docs/postman/raizes-do-nordeste.postman_collection.json
```

---

## Scripts uteis

```bash
npm run start:dev   # iniciar em desenvolvimento
npm run build       # compilar
npm run start:prod  # rodar build
npm run test        # testes unitarios (106 passando)
npm run test:cov    # cobertura
npm run test:e2e    # testes e2e
npm run db:seed     # seed do banco
npm run lint        # eslint
npm run format      # prettier
```

---

## O que eu ja implementei

### Auth

- [x] `POST /auth/sign-in`
- [x] `POST /auth/refresh-token`
- [x] `POST /auth/password-reset`
- [x] `POST /auth/reset-password`
- [x] `JwtAuthGuard`, `JwtRefreshGuard`, `PermissionGuard`
- [x] Permissoes por perfil (`ADMIN`, `STAFF`, `CUSTOMER`)

### Users

- [x] Cadastro publico de cliente (com CPF e consentimento LGPD)
- [x] CRUD administrativo em `/users` e `/users/management`
- [x] View model sem expor senha

### Stores (unidades)

- [x] CRUD de unidades
- [x] `GET /stores/:id/menu` — cardapio da unidade com disponibilidade de estoque

### Products e Stocks

- [x] CRUD de produtos
- [x] Estoque global e por loja
- [x] Ajuste de quantidade e transferencia entre estoques
- [x] Validacao de estoque na criacao do pedido

### Orders (fluxo critico)

- [x] Criar pedido com canal obrigatorio (`channel`)
- [x] Listar/filtrar pedidos (por canal, status, paginacao)
- [x] Atualizar status
- [x] Cancelar pedido
- [x] Confirmar pagamento mock via `PATCH /orders/:id`

### Payments

- [x] Servico mock com persistencia (request/response JSON)
- [x] Integrado ao fluxo de pedidos (nao criei rota `/payments` separada de proposito)

### Loyalty (fidelizacao)

- [x] Acumulo de pontos apos pagamento aprovado (10% do total)
- [x] `GET /loyalty/balance` — consultar saldo
- [x] `POST /loyalty/redeem` — resgate simples (exige consentimento)

### Infraestrutura e entrega tecnica

- [x] Arquitetura em camadas (Domain / Application / Infrastructure / API)
- [x] Prisma + migrations + seed
- [x] Swagger em `/docs`
- [x] `.env.example`
- [x] DER em `docs/DER.png`
- [x] Colecao Postman em `docs/postman/`
- [x] Plano de testes em `docs/test_plan.md`
- [x] 106 testes unitarios passando

---

## O que ainda falta

### Funcionalidades

- [ ] Promocoes/campanhas
- [ ] Logs/auditoria de acoes sensiveis
- [ ] Padrao de erro 100% igual ao template do roteiro
- [ ] Documentacao LGPD completa (finalidade, base legal, retencao)
- [ ] Testes e2e do fluxo principal

### Entrega academica (PDF)

- [ ] PDF final seguindo ABNT
- [ ] Diagrama de casos de uso
- [ ] Diagrama de classes
- [ ] Diagrama de sequencia/atividade do fluxo critico
- [ ] Atualizar `docs/openapi.json` exportado do Swagger

---

## Minha estimativa de progresso

| Perspectiva | Estimativa |
|---|---|
| Backend tecnico (API rodando) | ~88–90% |
| Entrega completa do roteiro | ~74–78% |

O codigo ja cobre o MVP. O que mais falta agora e a parte documental do PDF e alguns complementos (promocoes, auditoria, LGPD escrita).

---

## Arquitetura do projeto

Organizei o codigo por modulos, cada um com `domain` → `application` → `infra`:

```
src/
├── core/                    # config, erros globais, token
└── modules/
    ├── accounts/            # usuarios e clientes
    ├── auth/                # login, refresh, reset de senha
    ├── stores/              # unidades + cardapio
    ├── products/            # produtos
    ├── stocks/              # estoque global e por loja
    ├── orders/              # pedidos
    ├── payments/            # pagamento mock (servico interno)
    └── loyalty/             # fidelizacao
```

---

## Endpoints da API

### Auth

| Metodo | Rota | Auth |
|---|---|---|
| POST | `/auth/sign-in` | publico |
| POST | `/auth/refresh-token` | refresh token |
| POST | `/auth/password-reset` | publico |
| POST | `/auth/reset-password` | publico |

### Users

| Metodo | Rota | Auth |
|---|---|---|
| POST | `/users` | publico (cadastro cliente) |
| POST | `/users/management` | JWT + permissao |
| GET | `/users` | JWT + permissao |
| GET | `/users/:id` | JWT |
| PATCH | `/users/:id` | JWT + permissao |
| DELETE | `/users/:id` | JWT + permissao |

### Stores

| Metodo | Rota | Auth |
|---|---|---|
| POST | `/stores` | JWT + permissao |
| GET | `/stores` | publico |
| GET | `/stores/:id/menu` | publico |
| GET | `/stores/:id` | publico |
| PUT | `/stores/:id` | JWT + permissao |
| DELETE | `/stores/:id` | JWT + permissao |

### Products, Stocks, Orders, Loyalty

Consulte o Swagger em `/docs` para o detalhe completo de produtos, estoque, pedidos e fidelizacao.

---

## Fluxo critico que escolhi

Escolhi o fluxo **Pedido → Pagamento mock → Atualizacao de status**, que e o recomendado no roteiro:

```text
1. POST /orders          -> cria pedido, valida estoque, debita a loja
2. PATCH /orders/:id     -> { "confirmPayment": true }  -> mock + pontos de fidelidade
3. PATCH /orders/:id     -> { "status": "shipped" }      -> atualiza status operacional
4. DELETE /orders/:id    -> cancela pedido
```

Exemplo de criacao de pedido (IDs do seed):

```json
{
  "storeId": "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
  "customerId": "uuid-do-usuario-cliente",
  "channel": "online",
  "items": [
    { "productId": "11111111-1111-4111-8111-111111111111", "quantity": 2 }
  ]
}
```

Confirmar pagamento mock:

```json
{
  "confirmPayment": true,
  "simulatePaymentFailure": false
}
```

Filtrar pedidos por canal:

```text
GET /orders?channel=online&status=pending&page=1&limit=10
```

---

## Multicanalidade

O roteiro pede registro do canal de origem do pedido. No meu projeto, usei o campo `channel` (nao renomeei para `canalPedido` — no PDF explico que cumpre o mesmo papel).

| O que o roteiro pede | Como implementei |
|---|---|
| Canal obrigatorio na criacao | `channel` no `POST /orders` |
| Filtro por canal | `GET /orders?channel=` |
| Persistencia | enum `Channel` no Prisma |

Valores aceitos na API: `online`, `in_store`, `phone`.

---

## Modelo de dados

O schema Prisma esta em `prisma/schema.prisma`. O DER visual esta em `docs/DER.png`.

Entidades principais: `User`, `Customer`, `Store`, `Product`, `StoreStock`, `GlobalStock`, `Order`, `OrderItem`, `Payment`.

---

## Como testar

### Testes automatizados

```bash
npm run test
```

### Colecao Postman

Importe `docs/postman/raizes-do-nordeste.postman_collection.json` e execute na ordem:

1. **Auth** — cadastrar cliente → login (salva o token automaticamente)
2. **Stores** — cardapio da unidade
3. **Orders** — criar → pagar → atualizar status
4. **Loyalty** — consultar saldo → resgatar pontos
5. **Erros** — cenarios 401, 403, 409, 422

O plano completo com 16 cenarios esta em `docs/test_plan.md`.

---

## Meus proximos passos

1. Montar o **PDF final ABNT** (requisitos, diagramas, LGPD, conclusao)
2. Desenhar os **diagramas que faltam** (casos de uso, classes, sequencia)
3. Escrever a **documentacao LGPD** no PDF
4. (Opcional) promocoes, auditoria e padrao de erro completo

---

## Conclusao parcial

A parte de **usuarios, autenticacao, roles, CRUDs, estoque, pedidos, pagamento mock e fidelizacao** ja esta funcionando com persistencia real, Swagger, testes e documentacao tecnica no repositorio.

O ponto que ainda pesa mais para fechar a entrega e o **PDF academico** — o backend em si ja da para demonstrar o fluxo completo de ponta a ponta.
