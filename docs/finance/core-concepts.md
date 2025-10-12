# Core Concepts

The Finance app is built on **double-entry bookkeeping** - a 500-year-old accounting system that ensures financial data integrity.

## Double-Entry Bookkeeping

**Core Principle**: Money never appears or disappears. It always moves FROM one account TO another.

Every transaction has:
- **From Account** - Where money leaves
- **To Account** - Where money enters
- **Amount** - How much money moves

### Example: Salary Payment

```
Transaction: Received salary
From: "Salary" (income account)
To: "Bank" (asset account)
Amount: 10,000 EGP

Effect:
- Salary account balance: -10,000 EGP
- Bank account balance: +10,000 EGP
```

**Why is income negative?** In double-entry bookkeeping, income accounts track how much you've earned (which is a credit to you). The negative balance represents money flowing OUT of the income source INTO your assets.

## Account Types

The app uses 5 account types based on the accounting equation:

**Assets = Liabilities + Equity + (Income - Expenses)**

### 1. Asset Accounts (What You Own)

Positive balances represent money you have.

Examples:
- Cash Wallet
- Bank Account
- Savings Account
- Gold Holdings
- Accounts Receivable (money owed to you)
- Investment Account

### 2. Liability Accounts (What You Owe)

Positive balances represent money you need to pay.

Examples:
- Credit Card
- Loan
- Mortgage
- Accounts Payable (money you owe)

### 3. Income Accounts (Money Sources)

Negative balances represent how much you've earned.

Examples:
- Salary
- Freelance Income
- Investment Returns
- Rental Income

### 4. Expense Accounts (Spending Categories)

Positive balances represent how much you've spent.

Examples:
- Groceries
- Rent
- Transportation
- Entertainment
- Bills

### 5. Equity Accounts (Capital/Net Worth)

Special accounts for balancing and tracking net worth.

Examples:
- Opening Balances (auto-created)
- Owner's Capital
- Retained Earnings

## Transaction Flow Examples

### Example 1: Receive Salary

```
From: Salary (income)          Balance: -10,000
To: Bank (asset)               Balance: +10,000
Amount: 10,000 EGP
```

### Example 2: Buy Groceries

```
From: Bank (asset)             Balance: -500
To: Groceries (expense)        Balance: +500
Amount: 500 EGP
```

### Example 3: Pay Credit Card

```
From: Bank (asset)             Balance: -2,000
To: Credit Card (liability)    Balance: -2,000
Amount: 2,000 EGP
```

Note: Credit card balance goes down (from +2,000 to 0) because you're paying off what you owe.

### Example 4: Transfer Between Accounts

```
From: Bank (asset)             Balance: -3,000
To: Savings (asset)            Balance: +3,000
Amount: 3,000 EGP
```

## Opening Balances

When you create a new account with existing money, the app automatically:

1. Creates an "Opening Balances" equity account (if it doesn't exist)
2. Creates a transaction from "Opening Balances" to your new account
3. This balances the books - money doesn't appear from nowhere

**Example**: Creating a bank account with 5,000 EGP

```
Transaction: Opening balance for Bank
From: Opening Balances (equity)    Balance: -5,000
To: Bank (asset)                   Balance: +5,000
Amount: 5,000 EGP
```

### Cross-Currency Opening Balances

If your new account is in a different currency than your base currency, you must provide an exchange rate:

**Example**: User base currency is EGP, creating USD account with 100 USD

```
Opening balance: 100 USD
Exchange rate: 50 (1 EGP = 50 USD... wait, that's backwards!)
Correct rate: 0.02 (1 EGP = 0.02 USD, or 1 USD = 50 EGP)

Transaction: Opening balance for Bank USD
From: Opening Balances (EGP)     Balance: -5,000 EGP (100 ÷ 0.02)
To: Bank USD (USD)               Balance: +100 USD
Amount: 100 USD
Exchange Rate: 0.02
```

**Important**: The exchange rate follows the standard: `1 base currency = rate × account currency`

## Account Schema

```typescript
Account {
  id: string              // Unique ID
  name: string            // Display name (e.g., "Cash Wallet")
  description?: string    // Optional description
  currency: Currency      // EGP, USD, GOLD
  type: AccountType       // asset, liability, income, expense, equity
  balance: Decimal        // Current balance
  target?: Decimal        // For savings goals
  dueDate?: DateTime      // For goals and debts
  userId: string          // Owner
}
```

## Transaction Schema

```typescript
Transaction {
  id: string              // Unique ID
  description?: string    // Optional note
  amount: Decimal         // Transaction amount (in transaction currency)
  currency: Currency      // Transaction currency
  exchangeRate?: Decimal  // For cross-currency transactions
  date: DateTime          // When transaction occurred
  fromAccountId: string   // Source account
  toAccountId: string     // Destination account
  userId: string          // Owner
}
```

## Business Rules

1. **No Same-Account Transfers**: `fromAccountId` must be different from `toAccountId`

2. **User Ownership**: User must own both accounts involved in a transaction

3. **Positive Amounts**: Transaction amounts must be positive (direction is implicit in FROM/TO)

4. **Currency Consistency**: 
   - Same-currency: Simple balance updates
   - Cross-currency: Requires exchange rate

5. **Balance Updates**: When a transaction is created:
   - From account balance decreases
   - To account balance increases
   - Amounts adjusted by exchange rate if cross-currency

6. **Account Deletion**: Soft delete (sets `deletedAt` timestamp) to preserve transaction history

## Reporting Concepts

The double-entry system enables powerful reporting:

### Net Worth Calculation
```
Net Worth = Assets - Liabilities
```

### Income vs Expenses
```
Total Income = Sum of all income account balances (absolute value)
Total Expenses = Sum of all expense account balances
Net Income = Income - Expenses
```

### Budget Tracking
Compare expense account balances against budget targets.

### Asset Allocation
View distribution across different asset accounts (cash, savings, investments, etc.)

## Key Insights

1. **Everything Balances**: The sum of all account balances across all types should equal zero in a closed system

2. **Transaction History is Sacred**: Never modify past transactions - the exchange rates and amounts are historical facts

3. **Accounts are Categories**: Instead of tagging transactions with categories, transactions move money between categorical accounts (e.g., "Groceries" is an account, not a tag)

4. **Flexibility**: The account types are flexible - you can model complex scenarios:
   - Multiple bank accounts
   - Multiple income sources
   - Detailed expense categories
   - Debt tracking
   - Investment portfolios
   - Savings goals

5. **No "Uncategorized"**: Every transaction must specify both accounts - this enforces mindful money tracking

## Next Steps

- Read [Multi-Currency System](./multi-currency.md) to understand cross-currency transactions
- Review [Architecture](./architecture.md) to see how this is implemented in code

