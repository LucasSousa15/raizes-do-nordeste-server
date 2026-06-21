# Plano de Testes — Raizes do Nordeste API

Documento de evidencias para a Atividade Pratica Back-End 2026.  
Colecao executavel: [`postman/raizes-do-nordeste.postman_collection.json`](./postman/raizes-do-nordeste.postman_collection.json)

## Pre-requisitos

1. API rodando: `npm run start:dev`
2. Banco migrado: `npx prisma migrate deploy`
3. Seed aplicado: `npm run db:seed`
4. Importar a colecao Postman e usar variavel `baseUrl = http://localhost:3000`

## Ordem sugerida de execucao

1. Auth → Cadastro cliente → Login
2. Stores → Cardapio da unidade
3. Orders → Criar pedido → Confirmar pagamento → Atualizar status → Cancelar (cenario separado)
4. Loyalty → Consultar saldo → Resgatar pontos
5. Erros → Cenarios negativos

---

## Cenarios

| ID | Cenario | Metodo/Rota | Pre-condicao | Entrada | Saida esperada | Evidencia Postman |
|---|---|---|---|---|---|---|
| T01 | Login valido | POST `/auth/sign-in` | Usuario cadastrado | `{ email, password }` | 200 + `accessToken` | Auth/Login valido |
| T02 | Login senha invalida | POST `/auth/sign-in` | Usuario cadastrado | senha errada | 401 | Auth/Login senha invalida |
| T03 | Cadastro cliente valido | POST `/users` | — | body com `customerData.consent: true` | 201/200 + user | Auth/Cadastrar cliente |
| T04 | Acesso sem token | GET `/orders` | — | sem Authorization | 401 | Erros/Listar pedidos sem token |
| T05 | Acesso sem permissao | GET `/products` | Token de CUSTOMER | — | 403 | Erros/Listar produtos sem permissao |
| T06 | Cardapio por unidade | GET `/stores/:id/menu` | Seed aplicado | storeId do seed | 200 + items com `availableQuantity` | Stores/Cardapio da unidade |
| T07 | Criar pedido valido | POST `/orders` | Cliente logado + estoque | body com `channel`, `items` | 201 + pedido pending | Orders/Criar pedido |
| T08 | Pedido sem canal | POST `/orders` | Cliente logado | body sem `channel` | 422 | Erros/Criar pedido sem canal |
| T09 | Estoque insuficiente | POST `/orders` | quantidade > estoque | items com qty alta | 409 | Erros/Pedido estoque insuficiente |
| T10 | Pagamento mock aprovado | PATCH `/orders/:id` | Pedido pending | `{ confirmPayment: true }` | 200 + status confirmed | Orders/Confirmar pagamento |
| T11 | Pagamento mock recusado | PATCH `/orders/:id` | Pedido pending | `{ confirmPayment: true, simulatePaymentFailure: true }` | 409/422 | Orders/Pagamento recusado |
| T12 | Atualizar status | PATCH `/orders/:id` | Pedido confirmado | `{ status: "shipped" }` | 200 | Orders/Atualizar status |
| T13 | Cancelar pedido | DELETE `/orders/:id` | Pedido existente | — | 204 | Orders/Cancelar pedido |
| T14 | Consultar saldo fidelidade | GET `/loyalty/balance` | Cliente com pontos | token cliente | 200 + `points` | Loyalty/Consultar saldo |
| T15 | Resgatar pontos | POST `/loyalty/redeem` | Cliente com consent + pontos | `{ points: N }` | 200 + `remainingPoints` | Loyalty/Resgatar pontos |
| T16 | Resgate sem consentimento | POST `/loyalty/redeem` | consent=false | `{ points: 1 }` | 403 | Erros/Resgate sem consentimento |

---

## Cobertura obrigatoria do roteiro

| Requisito | Cenarios |
|---|---|
| Autenticacao e autorizacao | T01, T02, T04, T05 |
| Validacao de dados | T08 |
| Regra de negocio (estoque/pedido) | T07, T09 |
| Pagamento mock aprovado/recusado | T10, T11 |
| Multicanalidade | T07 + filtro `GET /orders?channel=online` |
| Fidelizacao com consentimento | T14, T15, T16 |

---

## Testes automatizados

```bash
npm run test
```

Modulos cobertos: auth, users, stores, products, stocks, orders, payments, loyalty.

---

## Logs/Auditoria

Nao implementado nesta versao. Acao sensivel (criacao/cancelamento de pedido, mudanca de status) sera registrada em versao futura.
