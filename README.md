![Brasil](https://img.shields.io/badge/Brasil-008C45?style=for-the-badge&logo=github&logoColor=ffffff&labelColor=FFCC29)

# Raízes do Nordeste — Backend (Lucas)

Este repositório é a implementação do Back-end do projeto "Raízes do Nordeste" — atividade prática da disciplina Projeto Multidisciplinar (Trilha Back-End, 2026).

Nota rápida: o repositório é público. NÃO compartilhe chaves ou `.env` com credenciais.

---

## Resumo técnico
- Autor: Lucas dos Anjos de Sousa
- Stack: NestJS + TypeScript
- ORM: Prisma (migrations presentes)
- Autenticação: JWT (serviço de token implementado)
- Testes: Vitest (unitários); objetivo: adicionar E2E e coleção Postman/Insomnia

---

## Quick English summary
![UK](https://img.shields.io/badge/UK-00247D?style=for-the-badge&logo=github&logoColor=ffffff&labelColor=C8102E)

Multichannel backend for a franchise network. Stack: NestJS + TypeScript, Prisma, JWT authentication. Tests with Vitest. Read the README (PT) for details.

---

## Como rodar (mínimo reproduzível)
1. Instale dependências:

```bash
npm install
```

2. Crie `.env` a partir de `.env.example` (a criar):
- `DATABASE_URL`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `JWT_ACCESS_EXPIRES_IN`
- `JWT_REFRESH_EXPIRES_IN`

3. Rode migrations (Prisma):

```bash
npx prisma migrate deploy
# ou em dev
npx prisma migrate dev
```

4. Inicie em modo dev:

```bash
npm run start:dev
```

Testes unitários:

```bash
npm run test
```

---

## Requisitos do roteiro e como o projeto atende
O roteiro exige objetivos, requisitos funcionais e não-funcionais, DER, documentação de API (OpenAPI/Swagger), mock de pagamento, LGPD mínimo e evidências (README, Postman/Insomnia, Swagger, DER). Abaixo uma TodoList do que já foi implementado e o que ainda está pendente.

### Requisitos funcionais (RF) — status
- Cadastro e autenticação (roles): parcial — `CreateUserUseCase` e token service presentes; falta fluxo de login/refresh e controllers.
- Cardápio por unidade / consulta por unidade: planejado (endpoints `/products` e `/units`).
- Pedidos com itens, valores, status e `canalPedido`: planejado; modelo do pedido ainda a confirmar no DER.
- Controle de estoque por unidade: opcional para o fluxo B (a definir como MVP alternativo).
- Programa de fidelização, promoções e mock de pagamento: documentação e estrutura previstas; implementação futura.

### Requisitos não funcionais (RNF)
- Segurança: senhas com hash (implementado), JWT (serviço implementado), cuidado com exposição de dados (parcial).
- Logs/auditoria: não implementado — declarar explicitamente se não for implementado.
- Documentação OpenAPI/Swagger: pendente (planejo gerar via decorators do NestJS).

---

## Artefatos exigidos pelo roteiro (planejamento)
- README claro e reproduzível (esta versão).
- DER (imagem/PDF) — a adicionar em `docs/DER.png`.
- OpenAPI/Swagger — gerar e commitar `docs/openapi.json`.
- Coleção Postman/Insomnia — adicionar em `docs/postman_collection.json`.
- Plano de testes com ≥10 cenários — adicionar em `docs/test_plan.md`.

---

## Documentação mínima de API (template)
Segue o template exigido pelo roteiro — exemplo para `/auth/login` e `/pedidos` será incluído no Swagger.

[Recurso] — [Nome do endpoint]
Finalidade: ...
Método/Rota: POST /auth/login
Auth/Permissão: público
Parâmetros: --
Request (JSON):
```
{ "email": "user@example.com", "senha": "Senha@123" }
```
Response 200:
```
{ "accessToken": "jwt...", "tokenType": "Bearer", "expiresIn": 3600, "user": { "id": 1, "nome": "Lucas" } }
```
Erros: 401, 400/422, etc. Padrão de erro JSON será adotado conforme roteiro.

---

## LGPD, privacidade e segurança (resumo)
- Dados pessoais coletados: `name`, `email`, `telefone` — finalidade: autenticação, histórico de pedidos e fidelização.
- Consentimento: armazenar `consentimentoAt` quando aplicável (marketing/fidelidade).
- Armazenamento seguro: senhas hasheadas; não enviar `password` em responses.
- Logs sensíveis: registrar mudanças de status de pedidos e ações administrativas (quando implementado).

---

## Plano de testes (resumo)
Meta: ≥10 cenários (≥6 positivos, ≥4 negativos). Exemplos:
- T01: Login válido (POST /auth/login) → 200 + accessToken
- T02: Acesso sem token (GET /pedidos) → 401
- T03: Criar pedido com estoque insuficiente → 409
- T04: Pagamento mock recusado → atualizar status de pedido
(Detalhes a incluir em `docs/test_plan.md` e na coleção Postman.)

---

## Status: o que está feito
- `prisma/` com `schema.prisma` e migrações — presente
- `src/modules/accounts/application/use-cases/create-user.use-case.ts` — implementado (hash de senha com bcrypt)
- `src/modules/accounts/infra/database/prisma/mappers/prisma-user.mapper.ts` — implementado
- `src/modules/accounts/infra/database/prisma/prisma-users.repository.ts` — `create` implementado; demais métodos pendentes
- `src/core/providers/cryptography/implementation/brcypt.provider.ts` — provider de hash implementado
- `src/core/token/implementation/jwt-token.service.ts` — serviço JWT implementado
- Testes unitários do caso de uso em `test/accounts/use-cases/create-user.spec.ts`

---

## Status: o que falta
1. Implementar controllers/rotas HTTP para `usuarios` e `auth` (endpoints + validações + documentação)
2. Completar `PrismaUsersRepository` (findByEmail, findById, findMany, update, delete)
3. Implementar módulo `auth` (login, refresh, logout) e guards (roles)
4. Implementar fluxo crítico escolhido (Pedido → Pagamento mock → Atualização de status) ou o fluxo de Estoque por unidade
5. Gerar OpenAPI/Swagger e coleção Postman/Insomnia
6. Adicionar `.env.example`, `docs/DER.png`, `docs/postman_collection.json` e `docs/test_plan.md`
7. Adicionar E2E tests cobrindo o fluxo crítico

---

## Próximos passos 
Vou dividir as próximas entregas em itens acionáveis para você mapear prioridades e estimativas.

Prioridade alta (MVP / entrega obrigatória):
- [ ] Implementar controllers básicos de `usuarios` (endpoints, DTOs, validação, testes unitários)
- [ ] Completar `PrismaUsersRepository` (findByEmail, findById, findMany, update, delete)
- [ ] Implementar módulo `auth` (login, refresh, logout) e guards (roles)
- [ ] Implementar fluxo crítico (escolher: Pedido→Pagamento mock→Atualização de status OR Estoque por unidade)
- [ ] Implementar multicanalidade: incluir `canalPedido` no contrato de pedido e permitir filtro por canal

Prioridade média (documentação e evidências):
- [ ] Criar `.env.example` com variáveis mínimas
- [ ] Gerar OpenAPI/Swagger e commitar export em `docs/openapi.json`
- [ ] Criar coleção Postman/Insomnia e salvar em `docs/postman_collection.json`
- [ ] Gerar DER e commitar imagem em `docs/DER.png`
- [ ] Escrever `docs/test_plan.md` com ≥10 cenários (≥6 positivos, ≥4 negativos)

Prioridade baixa (entrega/qualidade):
- [ ] Adicionar E2E tests cobrindo o fluxo crítico
- [ ] Preparar entrega final em PDF conforme ABNT (arquivo único)
- [ ] Garantir mínimo 5 commits representativos no repositório
- [ ] Revisar dependências (harmonizar `bcrypt` vs `bcryptjs`)

---

_Assinado: Lucas dos Anjos de Sousa_
