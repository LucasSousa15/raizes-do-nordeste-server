# Diagramas do Projeto

Todos os diagramas abaixo estao em **Mermaid** e foram gerados a partir do `prisma/schema.prisma`, dos casos de uso implementados e do fluxo critico do projeto (Pedido → Pagamento mock → Atualizacao de status). Podem ser renderizados direto no GitHub, em IDEs (VS Code com extensao Mermaid) ou via `mermaid-cli`.

> Imagem estatica do DER: [`DER.png`](./DER.png) — gerada a partir de [`DER.mmd`](./DER.mmd).

---

## 1. Diagrama de Casos de Uso

Atores e casos de uso cobertos pela API. Os casos estao agrupados por modulo.

```mermaid
flowchart LR
    %% Atores
    ClienteApp["Cliente (App/Web/Totem)"]
    Atendente["Atendente (Balcao)"]
    Cozinha["Cozinha"]
    Gerente["Gerente / Administrador"]
    Gateway["Gateway de Pagamento (Mock)"]

    subgraph Auth["Auth"]
        UC_SIGNIN[/"Fazer login"/]
        UC_REFRESH[/"Renovar token"/]
        UC_LOGOUT[/"Logout (revoga refresh)"/]
        UC_RESET[/"Resetar senha"/]
    end

    subgraph Users["Usuarios"]
        UC_REGISTER[/"Cadastrar cliente (LGPD)"/]
        UC_MGMT[/"Gerenciar usuarios (admin)"/]
    end

    subgraph Stores["Unidades"]
        UC_LIST_STORES[/"Listar unidades"/]
        UC_MENU[/"Ver cardapio da unidade"/]
        UC_MGMT_STORES[/"CRUD de unidades (admin)"/]
    end

    subgraph Products["Produtos e Estoque"]
        UC_LIST_PROD[/"Listar produtos"/]
        UC_MGMT_STOCK[/"Ajustar / transferir estoque"/]
    end

    subgraph Orders["Pedidos"]
        UC_CREATE_ORDER[/"Criar pedido"/]
        UC_LIST_ORDERS[/"Listar / filtrar pedidos"/]
        UC_UPDATE_STATUS[/"Atualizar status"/]
        UC_CANCEL[/"Cancelar pedido"/]
        UC_PAY[/"Confirmar pagamento (mock)"/]
    end

    subgraph Loyalty["Fidelidade"]
        UC_BALANCE[/"Consultar saldo de pontos"/]
        UC_REDEEM[/"Resgatar pontos"/]
        UC_HISTORY[/"Ver historico de pontos"/]
    end

    %% Relacionamentos ator -> caso de uso
    ClienteApp --> UC_SIGNIN
    ClienteApp --> UC_REGISTER
    ClienteApp --> UC_LIST_STORES
    ClienteApp --> UC_MENU
    ClienteApp --> UC_CREATE_ORDER
    ClienteApp --> UC_LIST_ORDERS
    ClienteApp --> UC_PAY
    ClienteApp --> UC_BALANCE
    ClienteApp --> UC_REDEEM
    ClienteApp --> UC_HISTORY
    ClienteApp --> UC_LOGOUT

    Atendente --> UC_LIST_STORES
    Atendente --> UC_MENU
    Atendente --> UC_LIST_ORDERS
    Atendente --> UC_UPDATE_STATUS

    Cozinha --> UC_LIST_ORDERS
    Cozinha --> UC_UPDATE_STATUS

    Gerente --> UC_MGMT
    Gerente --> UC_MGMT_STORES
    Gerente --> UC_MGMT_STOCK
    Gerente --> UC_LIST_ORDERS
    Gerente --> UC_CANCEL

    Gateway --> UC_PAY

    %% Reuso (UC_REFRESH e UC_RESET sao auxiliares compartilhados)
    UC_SIGNIN -.-> UC_REFRESH
    UC_REFRESH -.-> UC_LOGOUT
```

### Descricao dos casos de uso principais

#### UC-CRIT-1 — Criar Pedido

| Campo | Descricao |
|---|---|
| **Ator principal** | Cliente (App/Web/Totem) |
| **Pre-condicoes** | Cliente autenticado (JWT); unidade e produtos existem; ha estoque disponivel |
| **Pos-condicoes** | Pedido criado em status `PENDING`; estoque da unidade debitado; `AuditLog` registrado |
| **Fluxo principal** | 1. Cliente envia `POST /orders` com `storeId`, `channel`, `items[]`. 2. Sistema valida unidade e produtos. 3. Sistema valida estoque por item. 4. Sistema calcula total e cria o pedido. 5. Sistema debita `StoreStock`. 6. Sistema responde `201` com pedido criado. |
| **Excecoes** | `404` unidade/produto inexistente; `409` estoque insuficiente; `422` payload invalido; `401/403` sem permissao |
| **Regras de negocio** | `channel` obrigatorio; quantidade > 0; preco congelado no item no momento da criacao |

#### UC-CRIT-2 — Confirmar Pagamento (Mock + Idempotencia)

| Campo | Descricao |
|---|---|
| **Ator principal** | Cliente (App/Web/Totem) |
| **Atores secundarios** | Gateway de Pagamento (Mock interno) |
| **Pre-condicoes** | Pedido existe e esta em `PENDING` ou `IN_KITCHEN`; cliente envia header `Idempotency-Key` |
| **Pos-condicoes** | Pedido movido para `CONFIRMED`; pontos creditados; `Payment` e `AuditLog` registrados |
| **Fluxo principal** | 1. Cliente envia `PATCH /orders/:id` com `{ confirmPayment: true }` e header `Idempotency-Key`. 2. Sistema consulta `IdempotencyKey`. 3. Se existir para o mesmo pedido, retorna estado atual. 4. Senao, chama `MockPaymentService.requestPayment` (deterministico pelo prefixo da chave). 5. Em sucesso: atualiza status, credita 10% do total em pontos, grava idempotency key. 6. Em falha: grava idempotency key com `422`, retorna `422 PAYMENT_FAILED`. |
| **Excecoes** | `409 IDEMPOTENCY_KEY_CONFLICT` se a chave pertence a outro pedido; `422 PAYMENT_FAILED` se mock rejeitar |
| **Regras de negocio** | Mesma chave + mesmo pedido = replay (sem novo pagamento); prefixo `approve-` aprova; prefixo `reject-` rejeita; sem prefixo = fallback 50% |

---

## 2. DER — Diagrama Entidade-Relacionamento

```mermaid
erDiagram
    User ||--o| Customer : "1:1"
    User ||--o{ RefreshToken : "1:N"
    User ||--o{ PasswordReset : "1:N"
    Customer ||--o{ Order : "1:N"
    Customer ||--o{ CustomerPromotion : "1:N"
    Store ||--o{ Order : "1:N"
    Store ||--o{ StoreStock : "1:N"
    Product ||--o{ StoreStock : "1:N"
    Product ||--o| GlobalStock : "1:1"
    Product ||--o{ OrderItem : "1:N"
    Order ||--o{ OrderItem : "1:N"
    Order ||--o{ Payment : "1:N"
    Order ||--o{ IdempotencyKey : "1:N"
    Promotion ||--o{ CustomerPromotion : "1:N"

    User {
        string id PK
        string name
        string email UK
        string password
        enum role
        enum status
        enum profile
    }

    Customer {
        string id PK
        string userId UK,FK
        string cpf UK
        boolean consent
        datetime consentAt
        int points
    }

    Store {
        string id PK
        string name
        string address
    }

    Product {
        string id PK
        string name
        string description
        float price
    }

    Order {
        string id PK
        string customerId FK
        string storeId FK
        enum channel
        float total
        enum status
        string couponCode
        float discount
    }

    OrderItem {
        string id PK
        string orderId FK
        string productId FK
        int quantity
        float price
    }

    StoreStock {
        string id PK
        string storeId FK
        string productId FK
        int quantity
    }

    GlobalStock {
        string id PK
        string productId UK,FK
        int quantity
    }

    Payment {
        string id PK
        string orderId FK
        string provider
        enum status
        json requestPayload
        json responsePayload
    }

    Promotion {
        string id PK
        string code UK
        float discount
        boolean isActive
        datetime expiresAt
    }

    CustomerPromotion {
        string id PK
        string customerId FK
        string promotionId FK
        boolean used
    }

    RefreshToken {
        string id PK
        string hashed_token UK
        string userId FK
        enum role
        datetime expires_at
    }

    PasswordReset {
        string id PK
        string hashed_token UK
        string user_id FK
        datetime expires_at
    }

    AuditLog {
        string id PK
        string userId
        string action
        string details
        datetime createdAt
    }

    IdempotencyKey {
        string id PK
        string key UK
        string orderId FK
        string paymentId UK,FK
        int responseStatus
        json responseBody
        datetime expiresAt
    }
```

### Cardinalidades e restricoes principais

- `User` 1:1 `Customer` (um usuario pode ser cliente; `Customer.userId` e UNIQUE).
- `Customer` 1:N `Order` (um cliente tem varios pedidos).
- `Store` 1:N `Order` (pedidos pertecem a uma unidade).
- `Store` 1:N `StoreStock` e `Product` 1:N `StoreStock` — cada combinacao `storeId+productId` e UNIQUE.
- `Product` 1:1 `GlobalStock` (`productId` UNIQUE em `GlobalStock`).
- `Order` 1:N `OrderItem`, `Order` 1:N `Payment`, `Order` 1:N `IdempotencyKey`.
- `Promotion` 1:N `CustomerPromotion` (vinculo por cliente; cada par cliente+promocao e UNIQUE).

---

## 3. Arquitetura em camadas

```mermaid
flowchart TB
    subgraph API["API (Interface / Controllers)"]
        C_AUTH[AuthController]
        C_USERS[UsersController]
        C_STORES[StoresController]
        C_PROD[ProductsController]
        C_STOCK[StocksController]
        C_ORD[OrdersController]
        C_LOY[LoyaltyController]
    end

    subgraph APP["Application (Use Cases / Services)"]
        UC_LOGIN[SignInUseCase]
        UC_LOGOUT[LogoutUseCase]
        UC_CREATE_ORDER[CreateOrderUseCase]
        UC_UPDATE_ORDER[UpdateOrderUseCase]
        UC_PAY[MockPaymentService]
        UC_ADD_POINTS[UpdateOrderUseCase.addLoyaltyPoints]
        UC_REDEEM[RedeemLoyaltyPointsUseCase]
        UC_HISTORY[GetLoyaltyHistoryUseCase]
        UC_AUDIT[AuditService]
    end

    subgraph DOM["Domain (Entities + Regras)"]
        D_ORDER[Order]
        D_PRODUCT[Product]
        D_STOCK[StoreStock]
        D_USER[User / Customer]
        D_PAY[Payment]
        D_LOY[Customer.points]
        D_AUDIT[AuditLog]
        D_IDEM[IdempotencyKey]
        REPOS[Repository Interfaces]
    end

    subgraph INF["Infrastructure"]
        PRISMA[Prisma Service]
        REPO_PRISMA[Prisma Repositories]
        GUARDS[Guards JWT/Permission]
        STRATS[Strategies JWT/Refresh]
    end

    C_AUTH --> UC_LOGIN
    C_AUTH --> UC_LOGOUT
    C_ORD --> UC_CREATE_ORDER
    C_ORD --> UC_UPDATE_ORDER
    C_LOY --> UC_REDEEM
    C_LOY --> UC_HISTORY

    UC_CREATE_ORDER --> D_ORDER
    UC_UPDATE_ORDER --> UC_PAY
    UC_UPDATE_ORDER --> UC_ADD_POINTS
    UC_ADD_POINTS --> D_LOY
    UC_UPDATE_ORDER --> UC_AUDIT
    UC_REDEEM --> UC_AUDIT

    UC_CREATE_ORDER --> REPOS
    UC_UPDATE_ORDER --> REPOS
    UC_PAY --> REPOS
    REPOS --> REPO_PRISMA
    REPO_PRISMA --> PRISMA
    PRISMA --> D_ORDER

    C_AUTH --> GUARDS
    C_ORD --> GUARDS
    GUARDS --> STRATS
```

---

## 4. Diagrama de Classes (dominio)

```mermaid
classDiagram
    class User {
        +string id
        +string name
        +string email
        +string password
        +Role role
        +UserStatus status
        +Profile profile
        +Customer customer
    }

    class Customer {
        +string id
        +string userId
        +string cpf
        +boolean consent
        +Date consentAt
        +number points
        +Order[] orders
        +addPoints(n)
        +redeemPoints(n)
    }

    class Store {
        +string id
        +string name
        +string address
        +StoreStock[] stocks
    }

    class Product {
        +string id
        +string name
        +string description
        +number price
        +StoreStock[] stocks
        +GlobalStock globalStock
    }

    class StoreStock {
        +string id
        +string storeId
        +string productId
        +number quantity
        +debit(n)
        +credit(n)
    }

    class GlobalStock {
        +string id
        +string productId
        +number quantity
        +debit(n)
        +credit(n)
    }

    class Order {
        +string id
        +string storeId
        +string customerId
        +Channel channel
        +OrderStatus status
        +number totalAmount
        +number discount
        +string couponCode
        +OrderItem[] items
        +Payment[] payments
        +updateStatus(s)
        +updateItems(items)
        +updateTotalAmount(t)
    }

    class OrderItem {
        +string id
        +string productId
        +number quantity
        +number price
    }

    class Payment {
        +string id
        +string orderId
        +string provider
        +PaymentStatus status
        +object requestPayload
        +object responsePayload
    }

    class Promotion {
        +string id
        +string code
        +number discount
        +boolean isActive
        +Date expiresAt
    }

    class CustomerPromotion {
        +string id
        +string customerId
        +string promotionId
        +boolean used
    }

    class AuditLog {
        +string id
        +string userId
        +string action
        +string details
        +Date createdAt
    }

    class IdempotencyKey {
        +string id
        +string key
        +string orderId
        +string paymentId
        +number responseStatus
        +object responseBody
        +Date expiresAt
    }

    User "1" --o "0..1" Customer : tem
    Customer "1" --o "N" Order : faz
    Store "1" --o "N" Order : recebe
    Store "1" --o "N" StoreStock : possui
    Product "1" --o "N" StoreStock : estoque por loja
    Product "1" --o "0..1" GlobalStock : estoque central
    Order "1" *-- "N" OrderItem : contem
    Order "1" --o "N" Payment : gera
    Order "1" --o "N" IdempotencyKey : protegido por
    Customer "1" --o "N" CustomerPromotion : recebe
    Promotion "1" --o "N" CustomerPromotion : aplicado a
```

---

## 5. Fluxo critico: Pedido → Pagamento mock → Status (sequencia)

```mermaid
sequenceDiagram
    autonumber
    actor Cliente as Cliente (App/Web/Totem)
    participant API as OrdersController
    participant UC as UpdateOrderUseCase
    participant IDEM as IdempotencyKeyRepository
    participant PAY as MockPaymentService
    participant PAY_REPO as PaymentRepository
    participant ORD_REPO as OrderRepository
    participant USERS as UsersRepository
    participant AUDIT as AuditService

    Cliente->>API: PATCH /orders/:id<br/>{ confirmPayment: true }<br/>Idempotency-Key: approve-xxx
    API->>UC: execute(id, { confirmPayment, idempotencyKey })
    UC->>ORD_REPO: findById(id)
    ORD_REPO-->>UC: Order

    alt Idempotency-Key ja usada (mesmo pedido)
        UC->>IDEM: findByKey(key)
        IDEM-->>UC: existing (orderId == order.id)
        UC->>ORD_REPO: findById(id) (refresh)
        ORD_REPO-->>UC: Order
        UC-->>API: Order (replay)
    else Idempotency-Key nova ou expirada
        UC->>PAY: requestPayment({ orderId, amount, customerId, idempotencyKey })
        Note over PAY: prefixo "approve-" = SUCCESS<br/>prefixo "reject-" = FAILED<br/>senao Math.random()
        PAY->>PAY_REPO: create(request, response)
        PAY_REPO-->>PAY: Payment
        PAY-->>UC: Payment

        alt Pagamento FAILED
            UC->>AUDIT: logAction(PAYMENT_FAILED, { orderId, paymentId })
            UC->>IDEM: create({ key, orderId, paymentId, status 422 })
            UC-->>API: throw PaymentNotApprovedError (422)
        else Pagamento SUCCESS
            UC->>USERS: addPoints(customerId, floor(total * 0.1))
            USERS-->>UC: novo saldo
            UC->>ORD_REPO: update(id, { status: CONFIRMED })
            ORD_REPO-->>UC: Order
            UC->>AUDIT: logAction(PAYMENT_APPROVED, ...)
            UC->>AUDIT: logAction(POINTS_EARNED, ...)
            UC->>IDEM: create({ key, orderId, paymentId, status 200, responseBody })
            UC-->>API: Order
        end
    end

    API-->>Cliente: 200 Order { status: CONFIRMED }
```

---

## 6. Fluxo critico: Pedido → Pagamento mock → Status (atividade)

```mermaid
flowchart TD
    A([Inicio: Cliente confirma pagamento]) --> B{Header Idempotency-Key?}
    B -- Nao --> X1[Pagamento com Math.random<br/>50% sucesso]
    B -- Sim --> C[Consultar IdempotencyKeyRepository]
    C --> D{Chave existe e nao expirou?}
    D -- Sim, mesmo orderId --> E[Replay: retornar Order atual]
    E --> F([Fim])
    D -- Sim, orderId diferente --> G[409 IDEMPOTENCY_KEY_CONFLICT]
    G --> F
    D -- Nao --> H[Chamar MockPaymentService.requestPayment]
    H --> I{simulateFailure = true<br/>ou prefixo reject-<br/>ou random false?}
    I -- Sim --> J[Status = FAILED]
    I -- Nao --> K[Status = SUCCESS]
    X1 --> I

    J --> L[AuditLog: PAYMENT_FAILED]
    L --> M[Gravar IdempotencyKey status=422]
    M --> N[throw PaymentNotApprovedError 422]
    N --> F

    K --> O[Credit pontos: floor total * 0.1]
    O --> P[Atualizar Order status = CONFIRMED]
    P --> Q[AuditLog: PAYMENT_APPROVED]
    Q --> R[AuditLog: POINTS_EARNED]
    R --> S[Gravar IdempotencyKey status=200]
    S --> T[Retornar Order]
    T --> F
```

---

## Como renderizar os diagramas localmente

```bash
# Instalar o CLI do Mermaid
npm i -g @mermaid-js/mermaid-cli

# Renderizar cada bloco em uma imagem (exemplo para o DER)
npx -p @mermaid-js/mermaid-cli mmdc -i docs/DER.mmd -o docs/DER.png -b transparent
```

Tambem e possivel copiar e colar cada bloco Mermaid direto em:

- GitHub (markdown nativo)
- VS Code (extensao **Markdown Preview Mermaid Support**)
- https://mermaid.live/