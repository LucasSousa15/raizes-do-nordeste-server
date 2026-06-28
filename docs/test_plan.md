# Plano de Testes — Raizes do Nordeste API (Atualizado)

Documento de evidencias para a Atividade Pratica Back-End 2026.  
Colecao executavel: [`postman/raizes-do-nordeste.postman_collection.json`](./postman/raizes-do-nordeste.postman_collection.json)

## Pre-requisitos

1. API rodando: `npm run start:dev`
2. Banco migrado: `npx prisma migrate deploy`
3. Seed aplicado: `npm run db:seed`
4. Importar a colecao Postman e usar variavel `baseUrl = http://localhost:3000`
5. Para cenarios de cupom, executar primeiro o resgate de pontos (T15) para obter um codigo promocional valido.

## Ordem sugerida de execucao

1. Auth → Cadastro cliente → Login
2. Stores → Cardapio da unidade
3. Loyalty → Consultar saldo → Resgatar pontos (gera cupom)
4. Orders → Criar pedido sem cupom → Criar pedido com cupom → Confirmar pagamento (credita pontos) → Atualizar status → Cancelar
5. Erros → Cenarios negativos
6. Auditoria → Verificar logs no banco

---

## Cenarios

| ID | Cenario | Metodo/Rota | Pre-condicao | Entrada | Saida esperada | Evidencia Postman |
|---|---|---|---|---|---|---|
| **Autenticacao & Cadastro** |
| T01 | Login valido | POST `/auth/sign-in` | Usuario cadastrado (seed) | `{ email, password }` | 200 + `accessToken` | Auth/Login valido |
| T02 | Login senha invalida | POST `/auth/sign-in` | Usuario cadastrado | senha errada | 401 | Auth/Login senha invalida |
| T03 | Cadastro cliente valido | POST `/users` | — | body com `customerData.consent: true` | 201 + user | Auth/Cadastrar cliente |
| **Autorizacao** |
| T04 | Acesso sem token | GET `/orders` | — | sem Authorization | 401 | Erros/Listar pedidos sem token |
| T05 | Acesso sem permissao (cliente acessa admin) | GET `/products` (rota admin) | Token de CUSTOMER | — | 403 | Erros/Listar produtos sem permissao |
| **Stores** |
| T06 | Cardapio por unidade | GET `/stores/:id/menu` | Seed aplicado | storeId do seed | 200 + items com `availableQuantity` | Stores/Cardapio da unidade |
| **Pedidos – Fluxo basico** |
| T07 | Criar pedido valido (sem cupom) | POST `/orders` | Cliente logado + estoque suficiente | body com `channel`, `items` | 201 + pedido pending, `totalAmount` sem desconto | Orders/Criar pedido |
| T08 | Pedido sem canal | POST `/orders` | Cliente logado | body sem `channel` | 422 | Erros/Criar pedido sem canal |
| T09 | Estoque insuficiente | POST `/orders` | quantidade > estoque | items com qty alta | 409 | Erros/Pedido estoque insuficiente |
| **Pagamentos & Status** |
| T10 | Pagamento mock aprovado | PATCH `/orders/:id` | Pedido pending | `{ confirmPayment: true }` | 200 + status `confirmed`, pontos creditados (10% do total) | Orders/Confirmar pagamento |
| T11 | Pagamento mock recusado | PATCH `/orders/:id` | Pedido pending | `{ confirmPayment: true, simulatePaymentFailure: true }` | 409 | Orders/Pagamento recusado |
| T12 | Atualizar status manual | PATCH `/orders/:id` | Pedido confirmado | `{ status: "shipped" }` | 200 | Orders/Atualizar status |
| T13 | Cancelar pedido | DELETE `/orders/:id` | Pedido existente | — | 204 | Orders/Cancelar pedido |
| **Fidelidade & Cupons** |
| T14 | Consultar saldo fidelidade | GET `/loyalty/balance` | Cliente logado com pontos | token cliente | 200 + `points` | Loyalty/Consultar saldo |
| T15 | Resgatar pontos (gera cupom) | POST `/loyalty/redeem` | Cliente com consent + pontos suficientes | `{ points: 20 }` | 200 + `couponCode`, `remainingPoints` | Loyalty/Resgatar pontos |
| T16 | Resgate sem consentimento | POST `/loyalty/redeem` | cliente com consent=false | `{ points: 10 }` | 403 | Erros/Resgate sem consentimento |
| T17 | Criar pedido com cupom valido | POST `/orders` | Cupom resgatado (T15) e nao usado | body com `couponCode` obtido | 201 + desconto aplicado, `discount` > 0, `totalAmount` reduzido | Orders/Criar pedido com cupom |
| T18 | Criar pedido com cupom invalido/expirado/nao vinculado | POST `/orders` | Cliente logado | `couponCode` inexistente ou ja usado | 400 | Erros/Cupom invalido |
| T19 | Cupom marcado como usado apos pedido | (verificar via GET ou banco) | Pedido criado com cupom (T17) | tentar reutilizar o mesmo codigo | 400 | Erros/Cupom ja utilizado |
| **Auditoria (Logs)** |
| T20 | Logs de auditoria criados | (consulta direta ao banco) | Executar T07, T10, T12, T13 | SELECT * FROM "AuditLog" | Registros com acoes `ORDER_CREATED`, `PAYMENT_APPROVED`, `ORDER_STATUS_UPDATED` | Evidencia via print do banco |
| **Logout** |
| T21 | Logout revoga refresh token | POST `/auth/logout` | Cliente logado (T01) | body com `refreshToken` | 204 e refresh subsequente retorna 401 | Auth/Logout |
| **Historico de fidelidade** |
| T22 | Historico de pontos do cliente | GET `/loyalty/history` | Cliente logado com pontos | token cliente | 200 + lista com tipos `EARN`, `REDEEM`, `ORDER_PAID` | Loyalty/Historico |
| **Idempotencia no pagamento** |
| T23 | Mesma chave no mesmo pedido nao gera novo pagamento | PATCH `/orders/:id` | Pedido pending | `{ confirmPayment: true, idempotencyKey: "approve-..." }` duas vezes | 200 + 1 unico pagamento na tabela `Payment` | Orders/Idempotencia |
| T24 | Chave de idempotencia com prefixo `reject-` | PATCH `/orders/:id` | Pedido pending | `{ confirmPayment: true, idempotencyKey: "reject-..." }` | 422 + entrada em `IdempotencyKey` | Orders/Idempotencia rejeitar |
| T25 | Chave de idempotencia reutilizada em pedidos diferentes | PATCH `/orders/:id` | Duas orders pending | mesma chave em orders diferentes | 409 | Erros/Conflito idempotencia |

---

## Cobertura obrigatoria do roteiro

| Requisito | Cenarios |
|---|---|
| Autenticacao e autorizacao | T01, T02, T04, T05 |
| Validacao de dados | T08 |
| Regra de negocio (estoque/pedido) | T07, T09 |
| Pagamento mock aprovado/recusado | T10, T11 |
| Multicanalidade | T07 + filtro `GET /orders?channel=online` |
| Fidelizacao com consentimento e resgate com geracao de cupom | T14, T15, T16 |
| Promocoes/Cupons (aplicacao de desconto) | T17, T18, T19 |
| Logs/Auditoria | T20 |
| Logout | T21 |
| Historico de fidelidade | T22 |
| Idempotencia no pagamento | T23, T24, T25 |

---

## Testes automatizados

```bash
npm run test        
npm run test:e2e   