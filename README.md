![Brasil](https://img.shields.io/badge/Brasil-008C45?style=for-the-badge&logo=github&logoColor=ffffff&labelColor=FFCC29)

# Raizes do Nordeste - Backend

Backend do projeto **Raizes do Nordeste**, desenvolvido para a atividade pratica de **Projeto Multidisciplinar - Trilha Back-End 2026**.

A solucao atende uma rede de lanchonetes em expansao, com autenticacao, perfis de acesso, unidades, produtos, estoque por loja, pedidos multicanal, pagamento mock integrado ao fluxo de pedidos e fidelizacao basica (acumulo de pontos).

> Observacao: como o repositorio e publico, nao subir `.env`, senhas, tokens ou credenciais reais.

---

## Stack

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

4. (Opcional) Popular banco com unidades, produtos e estoque:

```bash
npm run db:seed
```

5. Iniciar a API:

```bash
npm run start:dev
```

6. Acessar:

```text
API:     http://localhost:3000
Swagger: http://localhost:3000/docs
```

---

## Scripts

```bash
npm run start:dev   # iniciar em desenvolvimento
npm run build       # compilar
npm run start:prod  # rodar build
npm run test        # testes unitarios (Vitest)
npm run test:cov    # cobertura
npm run test:e2e    # testes e2e
npm run db:seed     # seed do banco
npm run lint        # eslint
npm run format      # prettier
```

---

## Mapa de progresso vs roteiro

Legenda: `[x]` implementado | `[~]` parcial | `[ ]` pendente

### 1. Analise e requisitos (20 pts)

| Requisito do roteiro | Status | Observacao |
|---|---|---|
| Cadastro e autenticacao com perfis/roles | [x] | JWT + permissoes por role |
| Gestao de unidades da rede | [x] | CRUD `/stores` |
| Cardapio por unidade | [~] | Produtos globais + estoque por loja; falta endpoint de cardapio filtrado por unidade |
| Criar/atualizar/cancelar pedidos | [x] | CRUD em `/orders` |
| Controle de estoque por unidade | [x] | `/stocks` com entrada, ajuste e transferencia |
| Restricao de venda por estoque | [x] | Validado em `CreateOrderUseCase` |
| Programa de fidelizacao | [~] | Acumulo de pontos apos pagamento aprovado; sem resgate |
| Promocoes/campanhas | [ ] | Apenas planejado/documentado como futuro |
| Pagamento mock | [~] | Servico mock + persistencia; sem rota `/payments` dedicada |
| Multicanalidade (canal de origem) | [x] | Campo `channel` obrigatorio na criacao + filtro `?channel=` na listagem |
| LGPD minimo | [~] | Consentimento e CPF modelados; falta documentacao de finalidade/base legal |
| Logs/auditoria | [ ] | Nao implementado |

### 2. Modelagem e arquitetura (20 pts)

| Item | Status | Observacao |
|---|---|---|
| Arquitetura em camadas (Domain/Application/Infra/API) | [x] | Modulos NestJS com separacao clara |
| DER no repositorio | [ ] | Schema Prisma pronto; falta imagem/PDF em `docs/` |
| Diagrama de casos de uso | [ ] | Pendente no PDF final |
| Diagrama de classes | [ ] | Pendente no PDF final |
| Diagrama de sequencia/atividade | [ ] | Recomendado no PDF final |
| Coerencia modelo x implementacao | [x] | Schema Prisma alinhado aos modulos implementados |

### 3. Implementacao da API (25 pts)

| Item | Status | Observacao |
|---|---|---|
| API executavel localmente | [x] | README + migrations + seed |
| Swagger em `/docs` | [x] | Configurado em `main.ts` |
| Persistencia real (Prisma) | [x] | Migrations + repositorios |
| Fluxo critico pedido -> pagamento mock -> status | [x] | Criar pedido, confirmar pagamento mock e atualizar status via `/orders` |
| Auth JWT + autorizacao por role | [x] | Guards + `PermissionGuard` |
| Paginacao em listagens | [x] | Pedidos e produtos |
| Padrão de erro padronizado | [~] | `GlobalExceptionFilter` existe, mas formato difere do template do roteiro |

### 4. Seguranca, LGPD e auditoria (15 pts)

| Item | Status |
|---|---|
| Hash de senha (bcrypt) | [x] |
| JWT access + refresh | [x] |
| Autorizacao por perfil em rotas | [x] |
| View models sem expor senha | [x] |
| Consentimento LGPD no cadastro de cliente | [x] |
| Documentacao LGPD (finalidade, base legal, retencao) | [ ] |
| Logs/auditoria de acoes sensiveis | [ ] |

### 5. Plano de testes (10 pts)

| Item | Status | Observacao |
|---|---|---|
| Testes unitarios automatizados | [x] | 99/100 passando (1 falha de mensagem em delete-order) |
| Minimo 10 cenarios documentados | [ ] | Proposta abaixo; falta `docs/test_plan.md` |
| Colecao Postman/Insomnia | [ ] | Pendente |
| Cobertura auth 401/403, validacao, estoque, pagamento negado | [~] | Coberta parcialmente nos testes unitarios |

### 6. Entrega tecnica e documentacao (10 pts)

| Item | Status |
|---|---|
| Repositorio Git com historico de commits | [x] |
| README reprodutivel | [~] |
| `.env.example` | [x] |
| DER (imagem/PDF) | [ ] |
| Colecao Postman/Insomnia | [ ] |
| PDF final ABNT | [ ] |
| `docs/openapi.json` atualizado | [~] |

---

## Arquitetura

```
src/
├── core/                    # config, erros globais, token
└── modules/
    ├── accounts/            # usuarios e clientes
    ├── auth/                # login, refresh, reset de senha
    ├── stores/              # unidades da rede
    ├── products/            # produtos/cardapio base
    ├── stocks/              # estoque global e por loja
    ├── orders/              # pedidos e cancelamento
    └── payments/            # pagamento mock (servico interno)
```

Cada modulo segue: `domain` -> `application` (use cases) -> `infra` (Prisma, HTTP).

---

## Endpoints implementados

### Auth

| Metodo | Rota | Auth | Descricao |
|---|---|---|---|
| POST | `/auth/sign-in` | publico | Login e retorno de tokens |
| POST | `/auth/refresh-token` | refresh token | Renovar access token |
| POST | `/auth/password-reset` | publico | Solicitar reset de senha |
| POST | `/auth/reset-password` | publico | Redefinir senha |

### Users

| Metodo | Rota | Auth | Descricao |
|---|---|---|---|
| POST | `/users` | publico | Cadastro de cliente |
| POST | `/users/management` | JWT + permissao | Criar usuario administrativo |
| GET | `/users` | JWT + permissao | Listar/buscar usuarios |
| GET | `/users/:id` | JWT + permissao | Buscar por id |
| PATCH | `/users/:id` | JWT + permissao | Atualizar usuario |
| DELETE | `/users/:id` | JWT + permissao | Remover usuario |

### Stores (unidades)

| Metodo | Rota | Auth | Descricao |
|---|---|---|---|
| POST | `/stores` | JWT + permissao | Criar unidade |
| GET | `/stores` | publico | Listar unidades |
| GET | `/stores/:id` | publico | Buscar unidade |
| PUT | `/stores/:id` | JWT + permissao | Atualizar unidade |
| DELETE | `/stores/:id` | JWT + permissao | Remover unidade |

### Products

| Metodo | Rota | Auth | Descricao |
|---|---|---|---|
| GET | `/products` | JWT + permissao | Listar produtos (paginado) |
| GET | `/products/:id` | JWT + permissao | Buscar produto |
| POST | `/products` | JWT + permissao | Criar produto |
| PATCH | `/products/:id` | JWT + permissao | Atualizar produto |
| DELETE | `/products/:id` | JWT + permissao | Remover produto |

### Stocks

| Metodo | Rota | Auth | Descricao |
|---|---|---|---|
| POST | `/stocks` | JWT + permissao | Adicionar estoque por loja |
| GET | `/stocks` | JWT + permissao | Consultar estoque global ou por loja |
| PUT | `/stocks` | JWT + permissao | Ajustar quantidade (delta) |
| POST | `/stocks/transfer` | JWT + permissao | Transferir entre estoques |

### Orders (fluxo critico)

| Metodo | Rota | Auth | Descricao |
|---|---|---|---|
| POST | `/orders` | JWT + `create:order` | Criar pedido (valida estoque e decrementa) |
| GET | `/orders` | JWT | Listar com filtros (`channel`, `status`, paginacao) |
| GET | `/orders/:id` | JWT | Buscar pedido |
| PATCH | `/orders/:id` | JWT + `update:order` | Atualizar status ou confirmar pagamento mock |
| DELETE | `/orders/:id` | JWT | Cancelar pedido (soft cancel) |

### Payments

| Metodo | Rota | Status |
|---|---|---|
| — | `/payments` | Nao exposto via HTTP; mock acionado por `PATCH /orders/:id` com `confirmPayment: true` |

### Fidelidade / Promocoes

| Recurso | Status |
|---|---|
| `/loyalty` | Nao implementado (pontos acumulados internamente apos pagamento) |
| `/promotions` | Nao implementado |

---

## Fluxo critico: Pedido -> Pagamento mock -> Status

```text
1. POST /orders          -> cria pedido (status: pending), valida estoque, debita loja
2. PATCH /orders/:id     -> { "confirmPayment": true }  -> mock aprova/recusa + registra Payment
3. PATCH /orders/:id     -> { "status": "shipped" }      -> cozinha/pronto/entregue (manual)
4. DELETE /orders/:id    -> cancela pedido
```

Exemplo de criacao de pedido:

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

Simular pagamento recusado (teste):

```json
{
  "confirmPayment": true,
  "simulatePaymentFailure": true
}
```

Filtrar pedidos por canal:

```text
GET /orders?channel=online&status=pending&page=1&limit=10
```

---

## Multicanalidade

O requisito tecnico e registrar o canal de origem do pedido e permitir consulta/filtro por canal.

**Implementado:**

| Aspecto | Status |
|---|---|
| Campo obrigatorio na criacao | [x] `channel` no body do `POST /orders` |
| Filtro por canal | [x] `GET /orders?channel=` |
| Persistencia no banco | [x] enum `Channel` no Prisma (`WEB`, `APP`, `TOTEM`, `IN_STORE`, `PICKUP`) |
| Valores aceitos na API | `online`, `in_store`, `phone` (mapeados para o banco) |

No PDF/documentacao, basta explicar que `channel` cumpre o mesmo papel do `canalPedido` descrito no roteiro — sem necessidade de renomear campos no codigo.

---

## Modelo de dados (Prisma)

Entidades principais:

- `User`, `Customer`, `RefreshToken`, `PasswordReset`
- `Store`, `Product`, `StoreStock`, `GlobalStock`
- `Order`, `OrderItem`, `Payment`

Enums relevantes no banco:

```prisma
enum Channel { WEB APP TOTEM IN_STORE PICKUP }
enum OrderStatus { PENDING IN_KITCHEN READY DELIVERED CANCELLED }
enum PaymentStatus { PENDING SUCCESS FAILED CANCELLED }
enum Role { CUSTOMER ADMIN STAFF }
```

Relacoes principais:

- `User` 1:1 `Customer`
- `Customer` 1:N `Order`
- `Store` 1:N `Order` e 1:N `StoreStock`
- `Order` 1:N `OrderItem` e 1:N `Payment`

---

## Seed

O comando `npm run db:seed` cria:

- 2 unidades (Centro e Praia)
- 10 produtos tipicos nordestinos
- Estoque global e estoque por unidade para cada produto

IDs fixos do seed facilitam testes manuais via Swagger/Postman.

---

## Testes automatizados

```bash
npm run test
```

Cobertura atual (modulos com testes unitarios):

- Auth (login, refresh, reset)
- Users (CRUD)
- Stores (CRUD)
- Products (CRUD)
- Stocks (consulta, ajuste, transferencia)
- Orders (criar, atualizar com pagamento, buscar, cancelar)
- Payments (mock service)

Pendencia conhecida: 1 teste falha por mensagem de erro em PT-BR vs string esperada em ingles (`delete-order.use-case.spec.ts`).

---

## Plano de testes proposto (para documentacao e Postman)

| ID | Cenario | Endpoint | Tipo |
|---|---|---|---|
| T01 | Login valido | POST `/auth/sign-in` | positivo |
| T02 | Login senha invalida | POST `/auth/sign-in` | negativo |
| T03 | Acesso sem token | GET `/orders` | negativo (401) |
| T04 | Acesso sem permissao | GET `/products` como CUSTOMER | negativo (403) |
| T05 | Cadastro cliente valido | POST `/users` | positivo |
| T06 | Cadastro e-mail duplicado | POST `/users` | negativo (409) |
| T07 | Criar pedido com canal | POST `/orders` | positivo |
| T08 | Criar pedido sem canal | POST `/orders` | negativo (422) |
| T09 | Pedido estoque insuficiente | POST `/orders` | negativo (409) |
| T10 | Pagamento mock aprovado | PATCH `/orders/:id` | positivo |
| T11 | Pagamento mock recusado | PATCH `/orders/:id` | negativo |
| T12 | Cancelar pedido | DELETE `/orders/:id` | positivo |
| T13 | Listar pedidos por canal | GET `/orders?channel=online` | positivo |
| T14 | Atualizar status cozinha | PATCH `/orders/:id` | positivo |
| T15 | Buscar unidade inexistente | GET `/stores/:id` | negativo (404) |

---

## Proximos passos (prioridade sugerida)

Foco em **implementacao e entregaveis tecnicos**, mantendo a nomenclatura atual do projeto.

### Prioridade alta — entregaveis obrigatorios do roteiro

1. **Colecao Postman/Insomnia** — fluxo Auth -> Pedido -> Pagamento mock -> Status, com cenarios de erro (401, 403, 409, 422)
2. **Plano de testes** — `docs/test_plan.md` com minimo 10 cenarios (6 positivos, 4 negativos)
3. **DER** — exportar diagrama do schema Prisma para `docs/DER.png` ou `docs/DER.pdf`
4. **PDF final ABNT** — requisitos, diagramas, endpoints reais, LGPD, testes e conclusao
5. **Corrigir teste falhando** — `delete-order.use-case.spec.ts` (mensagem PT-BR)

### Prioridade media — requisitos funcionais ainda incompletos

6. **Cardapio por unidade** — endpoint que retorne produtos com disponibilidade da loja (ex.: `GET /stores/:id/menu` ou filtro em `/stocks?storeId=`)
7. **Fidelizacao** — expor saldo de pontos e resgate simples (acumulo ja existe apos pagamento)
8. **Promocoes/campanhas** — ao menos regra documentada; endpoint simples se couber no escopo
9. **Padronizar erros** — enriquecer `GlobalExceptionFilter` com `error`, `details`, `timestamp`, `path`
10. **Documentar LGPD** — finalidade, base legal, consentimento e retencao (no PDF/README)

### Prioridade baixa — qualidade e rastreabilidade

11. **Logs/auditoria** — registrar criacao/cancelamento de pedido e mudanca de status
12. **Consulta de pagamentos** — `GET /orders/:id/payments` (opcional; fluxo ja funciona via PATCH)
13. **Testes e2e** do fluxo principal
14. **Atualizar `docs/openapi.json`** exportado do Swagger

---

## Conclusao parcial

O **MVP tecnico do backend ja esta implementado**: auth, CRUDs, estoque, pedidos multicanal, pagamento mock e fidelizacao basica (acumulo de pontos). O fluxo critico **Pedido -> Pagamento mock -> Atualizacao de status** funciona de ponta a ponta.

O que falta agora e majoritariamente **entrega documental e complementos funcionais** (cardapio por unidade, resgate de fidelidade, promocoes, auditoria) — nao renomeacao de campos ou refatoracao de contratos.
