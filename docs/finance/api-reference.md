# API Reference

Complete reference for Finance app API endpoints.

## Authentication

All endpoints require JWT authentication via cookie:

```http
Cookie: token=<jwt_token>
```

The middleware automatically verifies the token. Unauthenticated requests return:

```json
{
  "message": "Unauthorized"
}
```

## Response Format

### Success Response

```json
{
  "data": <result>
}
```

### Error Response

```json
{
  "message": "Error description"
}
```

## Accounts

The API provides separate endpoints for each account type for a clean RESTful design.

### Available Endpoints

Each account type has its own dedicated endpoints:

**Asset Accounts** (`/api/accounts`):
- `POST /api/accounts` - Create asset account
- `GET /api/accounts` - Get all asset accounts
- `GET /api/accounts/:id` - Get single asset account
- `PATCH /api/accounts/:id` - Update asset account
- `DELETE /api/accounts/:id` - Delete asset account

**Goals** (`/api/goals`):
- `POST /api/goals` - Create goal
- `GET /api/goals` - Get all goals
- `GET /api/goals/:id` - Get single goal
- `PATCH /api/goals/:id` - Update goal
- `DELETE /api/goals/:id` - Delete goal

**Loans** (`/api/loans`):
- `POST /api/loans` - Create loan
- `GET /api/loans` - Get all loans
- `GET /api/loans/:id` - Get single loan
- `PATCH /api/loans/:id` - Update loan
- `DELETE /api/loans/:id` - Delete loan

**Credit Cards** (`/api/credit-cards`):
- `POST /api/credit-cards` - Create credit card
- `GET /api/credit-cards` - Get all credit cards
- `GET /api/credit-cards/:id` - Get single credit card
- `PATCH /api/credit-cards/:id` - Update credit card
- `DELETE /api/credit-cards/:id` - Delete credit card

**Income Sources** (`/api/income`):
- `POST /api/income` - Create income source
- `GET /api/income` - Get all income sources
- `GET /api/income/:id` - Get single income source
- `PATCH /api/income/:id` - Update income source
- `DELETE /api/income/:id` - Delete income source

**Expense Categories** (`/api/expense`):
- `POST /api/expense` - Create expense category
- `GET /api/expense` - Get all expense categories
- `GET /api/expense/:id` - Get single expense category
- `PATCH /api/expense/:id` - Update expense category
- `DELETE /api/expense/:id` - Delete expense category

---

### Create Asset Account

Create a bank account, cash wallet, or savings account.

**Endpoint**: `POST /api/accounts`

**Request Body (Same Currency)**:
```json
{
  "name": "Cash Wallet",
  "description": "Physical cash on hand",
  "currency": "EGP",
  "openingBalance": 1000
}
```

**Request Body (Cross-Currency)**:
```json
{
  "name": "Bank USD",
  "description": "US Dollar bank account",
  "currency": "USD",
  "openingBalance": 100,
  "openingBalanceExchangeRate": 0.02
}
```

**Fields**:
- `name` (required): Account name
- `description` (optional): Account description
- `currency` (required): Currency code (`EGP`, `USD`, `GOLD`)
- `openingBalance` (optional): Starting balance (positive number)
- `openingBalanceExchangeRate` (required if cross-currency with opening balance): Exchange rate

---

### Create Goal

Create a savings goal with target amount and due date.

**Endpoint**: `POST /api/goals`

**Request Body**:
```json
{
  "name": "Emergency Fund",
  "description": "6 months expenses",
  "currency": "EGP",
  "target": 50000,
  "dueDate": "2025-12-31T23:59:59.000Z",
  "openingBalance": 10000
}
```

**Fields**:
- `name` (required): Goal name
- `description` (optional): Goal description
- `currency` (required): Currency code
- `target` (required): Target amount (positive number)
- `dueDate` (required): Due date (ISO 8601 datetime)
- `openingBalance` (optional): Current saved amount
- `openingBalanceExchangeRate` (required if cross-currency with opening balance)

---

### Create Loan

Create a loan or debt account with payoff due date.

**Endpoint**: `POST /api/loans`

**Request Body**:
```json
{
  "name": "Car Loan",
  "description": "Toyota loan from bank",
  "currency": "EGP",
  "dueDate": "2027-06-30T23:59:59.000Z",
  "openingBalance": 150000
}
```

**Fields**:
- `name` (required): Loan name
- `description` (optional): Loan description
- `currency` (required): Currency code
- `dueDate` (required): Payoff due date (ISO 8601 datetime)
- `openingBalance` (optional): Amount currently owed
- `openingBalanceExchangeRate` (required if cross-currency with opening balance)

---

### Create Credit Card

Create a credit card account.

**Endpoint**: `POST /api/credit-cards`

**Request Body**:
```json
{
  "name": "Visa Credit Card",
  "description": "Bank Misr Visa",
  "currency": "EGP",
  "openingBalance": 5000
}
```

**Fields**:
- `name` (required): Card name
- `description` (optional): Card description
- `currency` (required): Currency code
- `openingBalance` (optional): Current balance owed
- `openingBalanceExchangeRate` (required if cross-currency with opening balance)

---

### Create Income Source

Create an income source account (salary, freelance, investments, etc.).

**Endpoint**: `POST /api/income`

**Request Body**:
```json
{
  "name": "Salary",
  "description": "Monthly salary from Company X",
  "currency": "EGP",
  "openingBalance": 50000
}
```

**Fields**:
- `name` (required): Income source name
- `description` (optional): Income description
- `currency` (required): Currency code
- `openingBalance` (optional): Historical income already earned
- `openingBalanceExchangeRate` (required if cross-currency with opening balance)

---

### Create Expense Category

Create an expense category account (groceries, rent, entertainment, etc.).

**Endpoint**: `POST /api/expense`

**Request Body**:
```json
{
  "name": "Groceries",
  "description": "Food and household items",
  "currency": "EGP",
  "openingBalance": 8000
}
```

**Fields**:
- `name` (required): Expense category name
- `description` (optional): Category description
- `currency` (required): Currency code
- `openingBalance` (optional): Historical expenses already spent
- `openingBalanceExchangeRate` (required if cross-currency with opening balance)

**Response**: `200 OK`
```json
{
  "data": {
    "id": "clx...",
    "name": "Cash Wallet",
    "description": "Physical cash on hand",
    "currency": "EGP",
    "type": "asset",
    "balance": "1000.00",
    "target": null,
    "dueDate": null,
    "userId": "clx...",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

**Common Response Fields**:

All account types return the same response structure:
```json
{
  "data": {
    "id": "clx...",
    "name": "Account Name",
    "description": "Optional description",
    "currency": "EGP",
    "type": "asset",
    "balance": "1000.00",
    "target": null,
    "dueDate": null,
    "userId": "clx...",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

**Notes**:
- If `openingBalance > 0`, automatically creates:
  - "Opening Balances" equity account (if doesn't exist)
  - Transaction from "Opening Balances" to new account
- Each endpoint creates a specific account type:
  - `/api/accounts` → asset account
  - `/api/goals` → asset with target + dueDate
  - `/api/loans` → liability with dueDate
  - `/api/credit-cards` → liability
  - `/api/income` → income account
  - `/api/expense` → expense account
- For cross-currency opening balance (account currency ≠ user base currency):
  - `openingBalanceExchangeRate` is REQUIRED
  - Rate semantics: 1 base currency = rate × account currency
  - Example: Base is EGP, account is USD, rate = 0.02 means 1 EGP = 0.02 USD

**Errors**:
- `400`: Invalid input (validation error)
  - Missing required fields (`name`, `currency`)
  - Missing `target` for goals
  - Missing `dueDate` for goals and loans
  - Negative values for `openingBalance` or `target`
  - Missing exchange rate for cross-currency opening balance
  - Invalid date format for `dueDate`
- `401`: Not authenticated
- `500`: Server error

---

### Get All Asset Accounts

Fetch all asset accounts (bank accounts, cash wallets, savings accounts - excludes goals).

**Endpoint**: `GET /api/accounts`

**Response**: `200 OK`
```json
{
  "data": [
    {
      "id": "clx...",
      "name": "Cash Wallet",
      "description": "Physical cash on hand",
      "currency": "EGP",
      "type": "asset",
      "balance": "1000.00",
      "createdAt": "2024-01-15T10:30:00Z"
    },
    {
      "id": "cly...",
      "name": "Bank USD",
      "description": null,
      "currency": "USD",
      "type": "asset",
      "balance": "500.00",
      "createdAt": "2024-01-16T14:20:00Z"
    }
  ]
}
```

**Notes**:
- Returns only asset accounts (excludes goals)
- Sorted by creation date (newest first)
- Does NOT include goals, loans, credit cards, income, or expense accounts

**Errors**:
- `401`: Not authenticated
- `500`: Server error

---

### Get All Goals

**Endpoint**: `GET /api/goals`

Returns all goal accounts with `target` and `dueDate` fields.

---

### Get All Loans

**Endpoint**: `GET /api/loans`

Returns all loan accounts with `dueDate` field.

---

### Get All Credit Cards

**Endpoint**: `GET /api/credit-cards`

Returns all credit card accounts.

---

### Get All Income Sources

**Endpoint**: `GET /api/income`

Returns all income source accounts.

---

### Get All Expense Categories

**Endpoint**: `GET /api/expense`

Returns all expense category accounts.

---

### Get Single Asset Account

Fetch a specific asset account by ID.

**Endpoint**: `GET /api/accounts/:id`

**Response**: `200 OK`
```json
{
  "data": {
    "id": "clx...",
    "name": "Emergency Fund",
    "description": "6 months expenses",
    "currency": "EGP",
    "type": "asset",
    "balance": "10000.00",
    "target": "50000.00",
    "dueDate": "2025-12-31T23:59:59.000Z",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

**Notes**:
- Returns account with appropriate fields based on type
- Goals include `target` and `dueDate`
- Loans include `dueDate` but not `target`
- Simple accounts (credit cards, income, expense) don't include `target` or `dueDate`

**Errors**:
- `400`: Account not found or unauthorized
- `401`: Not authenticated
- `500`: Server error

---

### Update Asset Account

Update an existing asset account.

**Endpoint**: `PATCH /api/accounts/:id`

**Request Body**:
```json
{
  "name": "Updated Cash Wallet",
  "description": "Updated description",
  "currency": "USD"
}
```

**Allowed Fields**:
- `name` (optional): Updated name
- `description` (optional): Updated description
- `currency` (optional): Updated currency

**Response**: `200 OK`
```json
{
  "data": {
    "id": "clx...",
    "name": "Updated Cash Wallet",
    "description": "Updated description",
    "currency": "USD",
    "type": "asset",
    "balance": "1000.00",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

**Notes**:
- All fields are optional (partial update)
- Cannot update `balance` (changed via transactions)
- Cannot change account `type`

**Errors**:
- `400`: Invalid input or unauthorized
- `401`: Not authenticated
- `404`: Account not found
- `500`: Server error

---

### Delete Asset Account

Soft-delete an asset account.

**Endpoint**: `DELETE /api/accounts/:id`

**Response**: `200 OK`
```json
{
  "data": {
    "message": "Account deleted successfully"
  }
}
```

**Notes**:
- Soft delete (sets `deletedAt` timestamp)
- Preserves transaction history
- Associated transactions remain intact
- Deleted accounts won't appear in GET requests

**Errors**:
- `400`: Unauthorized or invalid
- `401`: Not authenticated
- `404`: Account not found
- `500`: Server error

---

### Get Single Goal

**Endpoint**: `GET /api/goals/:id`

Returns a goal account with `target` and `dueDate` fields.

---

### Update Goal

**Endpoint**: `PATCH /api/goals/:id`

**Request Body**:
```json
{
  "name": "Updated Goal",
  "target": 60000,
  "dueDate": "2026-12-31T23:59:59.000Z"
}
```

**Allowed Fields**: `name`, `description`, `currency`, `target`, `dueDate` (all optional)

---

### Delete Goal

**Endpoint**: `DELETE /api/goals/:id`

Soft-deletes a goal account.

---

### Get Single Loan

**Endpoint**: `GET /api/loans/:id`

Returns a loan account with `dueDate` field.

---

### Update Loan

**Endpoint**: `PATCH /api/loans/:id`

**Request Body**:
```json
{
  "name": "Updated Loan",
  "dueDate": "2028-06-30T23:59:59.000Z"
}
```

**Allowed Fields**: `name`, `description`, `currency`, `dueDate` (all optional)

---

### Delete Loan

**Endpoint**: `DELETE /api/loans/:id`

Soft-deletes a loan account.

---

### Get Single Credit Card

**Endpoint**: `GET /api/credit-cards/:id`

Returns a credit card account.

---

### Update Credit Card

**Endpoint**: `PATCH /api/credit-cards/:id`

**Allowed Fields**: `name`, `description`, `currency` (all optional)

---

### Delete Credit Card

**Endpoint**: `DELETE /api/credit-cards/:id`

Soft-deletes a credit card account.

---

### Get Single Income Source

**Endpoint**: `GET /api/income/:id`

Returns an income source account.

---

### Update Income Source

**Endpoint**: `PATCH /api/income/:id`

**Allowed Fields**: `name`, `description`, `currency` (all optional)

---

### Delete Income Source

**Endpoint**: `DELETE /api/income/:id`

Soft-deletes an income source account.

---

### Get Single Expense Category

**Endpoint**: `GET /api/expense/:id`

Returns an expense category account.

---

### Update Expense Category

**Endpoint**: `PATCH /api/expense/:id`

**Allowed Fields**: `name`, `description`, `currency` (all optional)

---

### Delete Expense Category

**Endpoint**: `DELETE /api/expense/:id`

Soft-deletes an expense category account.

---

## Transactions

### Create Transaction

Create a transaction moving money between two accounts.

**Endpoint**: `POST /api/transactions`

**Request Body (Same Currency)**:
```json
{
  "description": "Bought groceries",
  "fromAccountId": "clx...",
  "toAccountId": "cly...",
  "amount": 500,
  "date": "2024-01-15T14:30:00.000Z"
}
```

**Request Body (Cross Currency)**:
```json
{
  "description": "Converted USD to EGP",
  "fromAccountId": "clx...",
  "toAccountId": "cly...",
  "amount": 100,
  "currency": "USD",
  "exchangeRate": 50,
  "date": "2024-01-15T14:30:00.000Z"
}
```

**Fields**:
- `description` (required): Transaction description
- `fromAccountId` (required): Source account ID (where money leaves)
- `toAccountId` (required): Destination account ID (where money enters)
- `amount` (required): Positive number (in transaction currency)
- `currency` (optional for same-currency, required for cross-currency): Currency code
- `exchangeRate` (optional for same-currency, required for cross-currency): Conversion rate
- `date` (required): ISO 8601 datetime string

**Response**: `200 OK`
```json
{
  "data": {
    "id": "clz...",
    "description": "Converted USD to EGP",
    "amount": "100.00",
    "currency": "USD",
    "exchangeRate": "50.000000",
    "date": "2024-01-15T14:30:00.000Z",
    "fromAccountId": "clx...",
    "toAccountId": "cly...",
    "userId": "clx...",
    "createdAt": "2024-01-15T14:35:00.000Z",
    "fromAccount": {
      "id": "clx...",
      "name": "Bank USD",
      "currency": "USD",
      "balance": "400.00"
    },
    "toAccount": {
      "id": "cly...",
      "name": "Bank EGP",
      "currency": "EGP",
      "balance": "15000.00"
    }
  }
}
```

**Notes**:
- `fromAccountId` and `toAccountId` must be different
- User must own both accounts
- For cross-currency transactions:
  - `currency` must match one of the two accounts
  - `exchangeRate` is required and must be positive
  - Exchange rate semantics: `1 FROM currency = rate × TO currency`
- Account balances are updated atomically
- Returns transaction with updated account balances

**Errors**:
- `400`: Invalid input (validation error)
  - Same FROM and TO accounts
  - Missing currency for cross-currency
  - Missing exchange rate for cross-currency
  - Currency doesn't match accounts
  - Negative or zero amount
- `401`: Not authenticated
- `404`: Account not found or unauthorized
- `500`: Server error

---

### Get Transactions

Fetch all transactions for the authenticated user.

**Endpoint**: `GET /api/transactions`

**Response**: `200 OK`
```json
{
  "data": [
    {
      "id": "clz...",
      "description": "Bought groceries",
      "amount": "500.00",
      "currency": "EGP",
      "exchangeRate": null,
      "date": "2024-01-15T14:30:00.000Z",
      "fromAccountId": "clx...",
      "toAccountId": "cly...",
      "userId": "clx...",
      "createdAt": "2024-01-15T14:35:00.000Z",
      "fromAccount": {
        "id": "clx...",
        "name": "Bank",
        "currency": "EGP"
      },
      "toAccount": {
        "id": "cly...",
        "name": "Groceries",
        "currency": "EGP"
      }
    }
  ]
}
```

**Notes**:
- Returns only transactions where `deletedAt` is `null`
- Includes `fromAccount` and `toAccount` details
- Sorted by date (most recent first)

**Errors**:
- `401`: Not authenticated
- `500`: Server error

---

### Update Transaction

Update an existing transaction.

**Endpoint**: `PUT /api/transactions/:id`

**Request Body**:
```json
{
  "description": "Updated description",
  "amount": 600,
  "date": "2024-01-15T15:00:00.000Z"
}
```

**Fields** (all optional):
- `description`: Updated description
- `fromAccountId`: New FROM account ID
- `toAccountId`: New TO account ID
- `amount`: New amount
- `currency`: New currency (for cross-currency)
- `exchangeRate`: New exchange rate (for cross-currency)
- `date`: New date

**Response**: `200 OK`
```json
{
  "data": {
    "id": "clz...",
    "description": "Updated description",
    "amount": "600.00",
    "currency": "EGP",
    "exchangeRate": null,
    "date": "2024-01-15T15:00:00.000Z",
    "fromAccountId": "clx...",
    "toAccountId": "cly...",
    "userId": "clx...",
    "createdAt": "2024-01-15T14:35:00.000Z",
    "updatedAt": "2024-01-15T15:05:00.000Z",
    "fromAccount": {
      "id": "clx...",
      "name": "Bank",
      "currency": "EGP",
      "balance": "9400.00"
    },
    "toAccount": {
      "id": "cly...",
      "name": "Groceries",
      "currency": "EGP",
      "balance": "600.00"
    }
  }
}
```

**Notes**:
- Only updates provided fields
- User must own the transaction
- If accounts change, user must own new accounts
- Process:
  1. Reverse old transaction (restore old balances)
  2. Apply new transaction (update with new values)
  3. Update transaction record
- Returns updated transaction with new account balances

**Errors**:
- `400`: Invalid input
- `401`: Not authenticated
- `404`: Transaction not found or unauthorized
- `500`: Server error

---

### Delete Transaction

Soft-delete a transaction and restore account balances.

**Endpoint**: `DELETE /api/transactions/:id`

**Response**: `200 OK`
```json
{
  "data": {
    "message": "Transaction deleted successfully"
  }
}
```

**Notes**:
- Soft delete (sets `deletedAt` timestamp)
- Restores account balances (reverses transaction)
- User must own the transaction
- Process:
  1. Fetch transaction (validate ownership)
  2. Reverse currency conversion (restore balances)
  3. Mark as deleted (`deletedAt = now()`)

**Errors**:
- `401`: Not authenticated
- `404`: Transaction not found or unauthorized
- `500`: Server error

---

## Common Error Responses

### 400 Bad Request

Invalid input or validation error:

```json
{
  "message": "Validation error: amount must be positive"
}
```

Common causes:
- Missing required fields
- Invalid data types
- Business rule violations

### 401 Unauthorized

Not authenticated:

```json
{
  "message": "Unauthorized"
}
```

Cause: Missing or invalid JWT token

### 404 Not Found

Resource not found or unauthorized:

```json
{
  "message": "One or more accounts not found or you don't have permission to use them"
}
```

Common causes:
- Account ID doesn't exist
- Transaction ID doesn't exist
- User doesn't own the resource

### 500 Internal Server Error

Server error:

```json
{
  "message": "Failed to create transaction"
}
```

Cause: Unexpected server error (logged server-side)

---

## Data Types

### Account

```typescript
{
  id: string
  name: string
  description: string | null
  currency: "EGP" | "USD" | "GOLD"
  type: "asset" | "liability" | "income" | "expense" | "equity"
  balance: string  // Decimal as string
  target: string | null  // For goals
  dueDate: string | null  // ISO datetime
  userId: string
  createdAt: string  // ISO datetime
}
```

### Transaction

```typescript
{
  id: string
  description: string | null
  amount: string  // Decimal as string
  currency: "EGP" | "USD" | "GOLD"
  exchangeRate: string | null  // Decimal as string
  date: string  // ISO datetime
  fromAccountId: string
  toAccountId: string
  userId: string
  createdAt: string  // ISO datetime
  fromAccount?: {  // Included in some responses
    id: string
    name: string
    currency: string
    balance?: string
  }
  toAccount?: {  // Included in some responses
    id: string
    name: string
    currency: string
    balance?: string
  }
}
```

---

## Testing with cURL

### Create Asset Account

```bash
curl -X POST http://localhost:3001/api/accounts \
  -H "Content-Type: application/json" \
  -H "Cookie: token=<jwt_token>" \
  -d '{
    "name": "Cash Wallet",
    "currency": "EGP",
    "openingBalance": 1000
  }'
```

### Create Goal

```bash
curl -X POST http://localhost:3001/api/goals \
  -H "Content-Type: application/json" \
  -H "Cookie: token=<jwt_token>" \
  -d '{
    "name": "Emergency Fund",
    "currency": "EGP",
    "target": 50000,
    "dueDate": "2025-12-31T23:59:59.000Z",
    "openingBalance": 10000
  }'
```

### Create Loan

```bash
curl -X POST http://localhost:3001/api/loans \
  -H "Content-Type: application/json" \
  -H "Cookie: token=<jwt_token>" \
  -d '{
    "name": "Car Loan",
    "currency": "EGP",
    "dueDate": "2027-06-30T23:59:59.000Z",
    "openingBalance": 150000
  }'
```

### Create Credit Card

```bash
curl -X POST http://localhost:3001/api/credit-cards \
  -H "Content-Type: application/json" \
  -H "Cookie: token=<jwt_token>" \
  -d '{
    "name": "Visa Credit Card",
    "currency": "EGP",
    "openingBalance": 5000
  }'
```

### Create Income Source

```bash
curl -X POST http://localhost:3001/api/income \
  -H "Content-Type: application/json" \
  -H "Cookie: token=<jwt_token>" \
  -d '{
    "name": "Salary",
    "currency": "EGP"
  }'
```

### Create Expense Category

```bash
curl -X POST http://localhost:3001/api/expense \
  -H "Content-Type: application/json" \
  -H "Cookie: token=<jwt_token>" \
  -d '{
    "name": "Groceries",
    "currency": "EGP"
  }'
```

### Get All Asset Accounts

```bash
curl -X GET http://localhost:3001/api/accounts \
  -H "Cookie: token=<jwt_token>"
```

### Get All Goals

```bash
curl -X GET http://localhost:3001/api/goals \
  -H "Cookie: token=<jwt_token>"
```

### Get All Loans

```bash
curl -X GET http://localhost:3001/api/loans \
  -H "Cookie: token=<jwt_token>"
```

### Get All Credit Cards

```bash
curl -X GET http://localhost:3001/api/credit-cards \
  -H "Cookie: token=<jwt_token>"
```

### Get All Income Sources

```bash
curl -X GET http://localhost:3001/api/income \
  -H "Cookie: token=<jwt_token>"
```

### Get All Expense Categories

```bash
curl -X GET http://localhost:3001/api/expense \
  -H "Cookie: token=<jwt_token>"
```

### Get/Update/Delete Asset Account

```bash
# Get
curl -X GET http://localhost:3001/api/accounts/<account_id> \
  -H "Cookie: token=<jwt_token>"

# Update
curl -X PATCH http://localhost:3001/api/accounts/<account_id> \
  -H "Content-Type: application/json" \
  -H "Cookie: token=<jwt_token>" \
  -d '{
    "name": "Updated Account Name"
  }'

# Delete
curl -X DELETE http://localhost:3001/api/accounts/<account_id> \
  -H "Cookie: token=<jwt_token>"
```

### Get/Update/Delete Goal

```bash
# Get
curl -X GET http://localhost:3001/api/goals/<goal_id> \
  -H "Cookie: token=<jwt_token>"

# Update
curl -X PATCH http://localhost:3001/api/goals/<goal_id> \
  -H "Content-Type: application/json" \
  -H "Cookie: token=<jwt_token>" \
  -d '{
    "target": 75000,
    "dueDate": "2026-12-31T23:59:59.000Z"
  }'

# Delete
curl -X DELETE http://localhost:3001/api/goals/<goal_id> \
  -H "Cookie: token=<jwt_token>"
```

### Get/Update/Delete Loan

```bash
# Get
curl -X GET http://localhost:3001/api/loans/<loan_id> \
  -H "Cookie: token=<jwt_token>"

# Update
curl -X PATCH http://localhost:3001/api/loans/<loan_id> \
  -H "Content-Type: application/json" \
  -H "Cookie: token=<jwt_token>" \
  -d '{
    "dueDate": "2028-12-31T23:59:59.000Z"
  }'

# Delete
curl -X DELETE http://localhost:3001/api/loans/<loan_id> \
  -H "Cookie: token=<jwt_token>"
```

### Get/Update/Delete Others

Credit cards, income sources, and expense categories follow the same pattern:

```bash
# Credit Card
GET    /api/credit-cards/:id
PATCH  /api/credit-cards/:id
DELETE /api/credit-cards/:id

# Income
GET    /api/income/:id
PATCH  /api/income/:id
DELETE /api/income/:id

# Expense
GET    /api/expense/:id
PATCH  /api/expense/:id
DELETE /api/expense/:id
```

### Create Transaction

```bash
curl -X POST http://localhost:3001/api/transactions \
  -H "Content-Type: application/json" \
  -H "Cookie: token=<jwt_token>" \
  -d '{
    "description": "Bought groceries",
    "fromAccountId": "clx...",
    "toAccountId": "cly...",
    "amount": 500,
    "date": "2024-01-15T14:30:00.000Z"
  }'
```

### Get Transactions

```bash
curl -X GET http://localhost:3001/api/transactions \
  -H "Cookie: token=<jwt_token>"
```

### Update Transaction

```bash
curl -X PUT http://localhost:3001/api/transactions/clz... \
  -H "Content-Type: application/json" \
  -H "Cookie: token=<jwt_token>" \
  -d '{
    "amount": 600
  }'
```

### Delete Transaction

```bash
curl -X DELETE http://localhost:3001/api/transactions/clz... \
  -H "Cookie: token=<jwt_token>"
```

---

## Rate Limiting

**Current**: No rate limiting implemented

**Future**: Consider adding rate limiting for production:
- 100 requests/minute per user
- Use Redis for distributed rate limiting
- Return `429 Too Many Requests` when exceeded

---

## Pagination

**Current**: All results returned at once

**Future**: Add pagination for large datasets:
- Query params: `?page=1&limit=50`
- Response includes pagination metadata:
  ```json
  {
    "data": [...],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 247,
      "pages": 5
    }
  }
  ```

---

## Next Steps

- Read [Architecture](./architecture.md) to understand implementation
- Review [Core Concepts](./core-concepts.md) for business logic
- Check [Multi-Currency System](./multi-currency.md) for currency handling

