import { PrismaClient, Currency, AccountType, Prisma } from '../generated/prisma'

const prisma = new PrismaClient()

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Generate random number between min and max (inclusive)
 */
function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * Generate random float between min and max
 */
function randomFloat(min: number, max: number, decimals: number = 2): number {
    const value = Math.random() * (max - min) + min
    return Number(value.toFixed(decimals))
}

/**
 * Pick random element from array
 */
function randomElement<T>(array: T[]): T {
    return array[randomInt(0, array.length - 1)]
}

/**
 * Generate random date in a specific month of the year
 */
function randomDateInMonth(year: number, month: number, hour?: number): Date {
    const day = randomInt(1, 28) // Safe for all months
    const randomHour = hour ?? randomInt(8, 22) // Business hours 8 AM - 10 PM
    const minute = randomInt(0, 59)
    return new Date(year, month, day, randomHour, minute)
}

/**
 * Generate date for a specific day of the month
 */
function specificDayInMonth(year: number, month: number, day: number, hour: number = 9): Date {
    return new Date(year, month, day, hour, 0)
}

/**
 * Weighted random currency selection (70% EGP, 30% USD)
 */
function randomCurrency(baseWeight: number = 0.7): Currency {
    return Math.random() < baseWeight ? Currency.EGP : Currency.USD
}

/**
 * Get exchange rate for currency
 */
function getExchangeRate(currency: Currency): number | null {
    if (currency === Currency.USD) {
        return 30.5 // 1 USD = 30.5 EGP
    }
    return null // EGP is base currency
}

// ============================================
// DATA CLEANUP
// ============================================

async function cleanExistingData(userId: string) {
    console.log('🧹 Cleaning existing data...')

    // Delete in correct order to respect foreign key constraints
    await prisma.budgetAccount.deleteMany({ where: { budget: { userId } } })
    await prisma.budget.deleteMany({ where: { userId } })
    await prisma.transaction.deleteMany({ where: { userId } })
    await prisma.account.deleteMany({ where: { userId } })
    await prisma.exchangeRate.deleteMany({ where: { userId } })
    await prisma.widgetPreference.deleteMany({ where: { userId } })

    console.log('✅ Existing data cleaned')
}

// ============================================
// ACCOUNT CREATION
// ============================================

interface AccountData {
    name: string
    description?: string
    type: AccountType
    currency: Currency
    target?: number
    dueDate?: Date
}

async function createAccounts(userId: string) {
    console.log('📁 Creating accounts...')

    const accounts: AccountData[] = [
        // Assets
        { name: 'Bank Account', description: 'Main bank account', type: AccountType.asset, currency: Currency.EGP },
        { name: 'Cash Wallet', description: 'Cash on hand', type: AccountType.asset, currency: Currency.EGP },
        { name: 'USD Savings', description: 'USD savings account', type: AccountType.asset, currency: Currency.USD },
        {
            name: 'Emergency Fund',
            description: 'Emergency savings goal',
            type: AccountType.asset,
            currency: Currency.EGP,
            target: 50000,
            dueDate: new Date(2025, 11, 31)
        },
        {
            name: 'Vacation Fund',
            description: 'Saving for vacation',
            type: AccountType.asset,
            currency: Currency.EGP,
            target: 30000,
            dueDate: new Date(2025, 5, 30)
        },

        // Liabilities
        { name: 'Credit Card', description: 'Visa credit card', type: AccountType.liability, currency: Currency.EGP },

        // Income Sources
        { name: 'Salary', description: 'Monthly salary', type: AccountType.income, currency: Currency.EGP },
        { name: 'Freelance Income', description: 'Freelance work', type: AccountType.income, currency: Currency.USD },
        { name: 'Investments', description: 'Investment returns', type: AccountType.income, currency: Currency.EGP },

        // Expense Categories
        { name: 'Groceries', description: 'Food and groceries', type: AccountType.expense, currency: Currency.EGP },
        { name: 'Rent', description: 'Monthly rent', type: AccountType.expense, currency: Currency.EGP },
        { name: 'Utilities', description: 'Electricity, water, internet', type: AccountType.expense, currency: Currency.EGP },
        { name: 'Transportation', description: 'Gas, uber, public transport', type: AccountType.expense, currency: Currency.EGP },
        { name: 'Entertainment', description: 'Movies, games, hobbies', type: AccountType.expense, currency: Currency.EGP },
        { name: 'Healthcare', description: 'Medical expenses', type: AccountType.expense, currency: Currency.EGP },
        { name: 'Shopping', description: 'Clothes, electronics, etc', type: AccountType.expense, currency: Currency.EGP },
        { name: 'Dining', description: 'Restaurants and cafes', type: AccountType.expense, currency: Currency.EGP },
        { name: 'Subscriptions', description: 'Netflix, Spotify, etc', type: AccountType.expense, currency: Currency.EGP },
        { name: 'Personal Care', description: 'Haircut, grooming', type: AccountType.expense, currency: Currency.EGP },
        { name: 'Gifts', description: 'Gifts for others', type: AccountType.expense, currency: Currency.EGP },
        { name: 'Miscellaneous', description: 'Other expenses', type: AccountType.expense, currency: Currency.EGP },

        // Equity (Opening Balances)
        { name: 'Opening Balances', description: 'Initial balances', type: AccountType.equity, currency: Currency.EGP },
    ]

    const createdAccounts: { [key: string]: string } = {}

    for (const accountData of accounts) {
        const account = await prisma.account.create({
            data: {
                ...accountData,
                target: accountData.target ? new Prisma.Decimal(accountData.target) : null,
                userId,
            },
        })
        createdAccounts[accountData.name] = account.id
        console.log(`  ✓ Created ${accountData.type}: ${accountData.name}`)
    }

    console.log(`✅ Created ${accounts.length} accounts`)
    return createdAccounts
}

// ============================================
// TRANSACTION GENERATION
// ============================================

interface TransactionInput {
    description: string
    amount: number
    currency: Currency
    exchangeRate: number | null
    fromAccountId: string
    toAccountId: string
    date: Date
}

async function generateTransactions(userId: string, accounts: { [key: string]: string }) {
    console.log('💸 Generating transactions...')

    const transactions: TransactionInput[] = []
    const currentYear = 2024

    // Generate transactions for each month (Jan 2024 - Dec 2024)
    for (let month = 0; month < 12; month++) {
        // ========== INCOME TRANSACTIONS ==========

        // Salary - 1st of each month
        transactions.push({
            description: 'Monthly Salary',
            amount: randomFloat(15000, 18000, 2),
            currency: Currency.EGP,
            exchangeRate: null,
            fromAccountId: accounts['Salary'],
            toAccountId: accounts['Bank Account'],
            date: specificDayInMonth(currentYear, month, 1, 9),
        })

        // Freelance Income - 1-2 times per month (USD)
        const freelanceCount = randomInt(1, 2)
        for (let i = 0; i < freelanceCount; i++) {
            transactions.push({
                description: randomElement(['Website Project', 'Consulting Work', 'Freelance Design', 'Mobile App Development']),
                amount: randomFloat(500, 2000, 2),
                currency: Currency.USD,
                exchangeRate: 30.5,
                fromAccountId: accounts['Freelance Income'],
                toAccountId: accounts['USD Savings'],
                date: randomDateInMonth(currentYear, month),
            })
        }

        // Investment income - occasionally
        if (Math.random() < 0.3) {
            transactions.push({
                description: 'Dividend Payment',
                amount: randomFloat(500, 1500, 2),
                currency: Currency.EGP,
                exchangeRate: null,
                fromAccountId: accounts['Investments'],
                toAccountId: accounts['Bank Account'],
                date: randomDateInMonth(currentYear, month),
            })
        }

        // ========== EXPENSE TRANSACTIONS ==========

        // Rent - Fixed amount on 1st of month
        transactions.push({
            description: 'Monthly Rent',
            amount: 5000,
            currency: Currency.EGP,
            exchangeRate: null,
            fromAccountId: accounts['Bank Account'],
            toAccountId: accounts['Rent'],
            date: specificDayInMonth(currentYear, month, 1, 10),
        })

        // Utilities - Once per month
        transactions.push({
            description: randomElement(['Electricity Bill', 'Internet Bill', 'Water Bill']),
            amount: randomFloat(300, 800, 2),
            currency: Currency.EGP,
            exchangeRate: null,
            fromAccountId: accounts['Bank Account'],
            toAccountId: accounts['Utilities'],
            date: randomDateInMonth(currentYear, month),
        })

        // Subscriptions - Monthly recurring
        transactions.push({
            description: 'Netflix Subscription',
            amount: 170,
            currency: Currency.EGP,
            exchangeRate: null,
            fromAccountId: accounts['Bank Account'],
            toAccountId: accounts['Subscriptions'],
            date: specificDayInMonth(currentYear, month, 5, 14),
        })

        if (Math.random() < 0.5) {
            transactions.push({
                description: 'Spotify Premium',
                amount: 120,
                currency: Currency.EGP,
                exchangeRate: null,
                fromAccountId: accounts['Bank Account'],
                toAccountId: accounts['Subscriptions'],
                date: randomDateInMonth(currentYear, month),
            })
        }

        // Groceries - 8-10 times per month
        const groceryCount = randomInt(8, 10)
        for (let i = 0; i < groceryCount; i++) {
            const currency = randomCurrency(0.8) // 80% EGP, 20% USD
            const fromAccount = currency === Currency.USD ? accounts['USD Savings'] : randomElement([accounts['Bank Account'], accounts['Cash Wallet']])

            transactions.push({
                description: randomElement(['Supermarket', 'Grocery Shopping', 'Fresh Produce', 'Weekly Groceries']),
                amount: currency === Currency.USD ? randomFloat(10, 50, 2) : randomFloat(300, 1200, 2),
                currency,
                exchangeRate: getExchangeRate(currency),
                fromAccountId: fromAccount,
                toAccountId: accounts['Groceries'],
                date: randomDateInMonth(currentYear, month),
            })
        }

        // Transportation - 5-8 times per month
        const transportCount = randomInt(5, 8)
        for (let i = 0; i < transportCount; i++) {
            transactions.push({
                description: randomElement(['Uber Ride', 'Gas Station', 'Metro Card', 'Parking Fee', 'Car Maintenance']),
                amount: randomFloat(50, 400, 2),
                currency: Currency.EGP,
                exchangeRate: null,
                fromAccountId: randomElement([accounts['Bank Account'], accounts['Cash Wallet']]),
                toAccountId: accounts['Transportation'],
                date: randomDateInMonth(currentYear, month),
            })
        }

        // Dining - 3-5 times per month
        const diningCount = randomInt(3, 5)
        for (let i = 0; i < diningCount; i++) {
            const currency = randomCurrency(0.7)
            const fromAccount = currency === Currency.USD ? accounts['USD Savings'] : randomElement([accounts['Bank Account'], accounts['Cash Wallet']])

            transactions.push({
                description: randomElement(['Restaurant', 'Cafe', 'Fast Food', 'Lunch', 'Dinner Out']),
                amount: currency === Currency.USD ? randomFloat(15, 60, 2) : randomFloat(200, 800, 2),
                currency,
                exchangeRate: getExchangeRate(currency),
                fromAccountId: fromAccount,
                toAccountId: accounts['Dining'],
                date: randomDateInMonth(currentYear, month),
            })
        }

        // Entertainment - 2-4 times per month
        const entertainmentCount = randomInt(2, 4)
        for (let i = 0; i < entertainmentCount; i++) {
            transactions.push({
                description: randomElement(['Movie Tickets', 'Concert', 'Gaming', 'Books', 'Hobbies']),
                amount: randomFloat(100, 500, 2),
                currency: Currency.EGP,
                exchangeRate: null,
                fromAccountId: randomElement([accounts['Bank Account'], accounts['Cash Wallet']]),
                toAccountId: accounts['Entertainment'],
                date: randomDateInMonth(currentYear, month),
            })
        }

        // Shopping - 1-3 times per month
        const shoppingCount = randomInt(1, 3)
        for (let i = 0; i < shoppingCount; i++) {
            const currency = randomCurrency(0.6)
            const fromAccount = currency === Currency.USD ? accounts['USD Savings'] : accounts['Bank Account']

            transactions.push({
                description: randomElement(['Clothes', 'Electronics', 'Shoes', 'Accessories', 'Online Shopping']),
                amount: currency === Currency.USD ? randomFloat(20, 150, 2) : randomFloat(500, 2500, 2),
                currency,
                exchangeRate: getExchangeRate(currency),
                fromAccountId: fromAccount,
                toAccountId: accounts['Shopping'],
                date: randomDateInMonth(currentYear, month),
            })
        }

        // Healthcare - occasionally
        if (Math.random() < 0.4) {
            transactions.push({
                description: randomElement(['Doctor Visit', 'Pharmacy', 'Lab Tests', 'Dental Care']),
                amount: randomFloat(300, 1500, 2),
                currency: Currency.EGP,
                exchangeRate: null,
                fromAccountId: accounts['Bank Account'],
                toAccountId: accounts['Healthcare'],
                date: randomDateInMonth(currentYear, month),
            })
        }

        // Personal Care - 1-2 times per month
        if (Math.random() < 0.7) {
            transactions.push({
                description: randomElement(['Haircut', 'Barber', 'Salon', 'Grooming Products']),
                amount: randomFloat(100, 400, 2),
                currency: Currency.EGP,
                exchangeRate: null,
                fromAccountId: randomElement([accounts['Bank Account'], accounts['Cash Wallet']]),
                toAccountId: accounts['Personal Care'],
                date: randomDateInMonth(currentYear, month),
            })
        }

        // Gifts - occasionally
        if (Math.random() < 0.3) {
            transactions.push({
                description: randomElement(['Birthday Gift', 'Anniversary Gift', 'Holiday Gift']),
                amount: randomFloat(300, 1000, 2),
                currency: Currency.EGP,
                exchangeRate: null,
                fromAccountId: accounts['Bank Account'],
                toAccountId: accounts['Gifts'],
                date: randomDateInMonth(currentYear, month),
            })
        }

        // Miscellaneous - 1-2 times per month
        const miscCount = randomInt(1, 2)
        for (let i = 0; i < miscCount; i++) {
            transactions.push({
                description: randomElement(['Other Expense', 'Miscellaneous', 'Various']),
                amount: randomFloat(100, 500, 2),
                currency: Currency.EGP,
                exchangeRate: null,
                fromAccountId: randomElement([accounts['Bank Account'], accounts['Cash Wallet']]),
                toAccountId: accounts['Miscellaneous'],
                date: randomDateInMonth(currentYear, month),
            })
        }

        // ========== TRANSFER TRANSACTIONS ==========

        // Bank to Cash withdrawals - 2-3 times per month
        const withdrawalCount = randomInt(2, 3)
        for (let i = 0; i < withdrawalCount; i++) {
            transactions.push({
                description: 'ATM Withdrawal',
                amount: randomFloat(1000, 3000, 2),
                currency: Currency.EGP,
                exchangeRate: null,
                fromAccountId: accounts['Bank Account'],
                toAccountId: accounts['Cash Wallet'],
                date: randomDateInMonth(currentYear, month),
            })
        }

        // Goal contributions - 1-2 times per month
        if (Math.random() < 0.8) {
            transactions.push({
                description: 'Emergency Fund Contribution',
                amount: randomFloat(500, 1500, 2),
                currency: Currency.EGP,
                exchangeRate: null,
                fromAccountId: accounts['Bank Account'],
                toAccountId: accounts['Emergency Fund'],
                date: randomDateInMonth(currentYear, month),
            })
        }

        if (Math.random() < 0.6) {
            transactions.push({
                description: 'Vacation Fund Contribution',
                amount: randomFloat(300, 1000, 2),
                currency: Currency.EGP,
                exchangeRate: null,
                fromAccountId: accounts['Bank Account'],
                toAccountId: accounts['Vacation Fund'],
                date: randomDateInMonth(currentYear, month),
            })
        }

        // Credit card payment - once per month
        transactions.push({
            description: 'Credit Card Payment',
            amount: randomFloat(2000, 5000, 2),
            currency: Currency.EGP,
            exchangeRate: null,
            fromAccountId: accounts['Bank Account'],
            toAccountId: accounts['Credit Card'],
            date: specificDayInMonth(currentYear, month, 15, 11),
        })

        // Cross-currency transfer - occasionally
        if (Math.random() < 0.3) {
            transactions.push({
                description: 'USD to EGP Conversion',
                amount: randomFloat(100, 500, 2),
                currency: Currency.USD,
                exchangeRate: 30.5,
                fromAccountId: accounts['USD Savings'],
                toAccountId: accounts['Bank Account'],
                date: randomDateInMonth(currentYear, month),
            })
        }
    }

    // Sort transactions by date
    transactions.sort((a, b) => a.date.getTime() - b.date.getTime())

    console.log(`  Preparing to create ${transactions.length} transactions...`)

    // Create all transactions
    let count = 0
    for (const txn of transactions) {
        await prisma.transaction.create({
            data: {
                ...txn,
                amount: new Prisma.Decimal(txn.amount),
                exchangeRate: txn.exchangeRate ? new Prisma.Decimal(txn.exchangeRate) : null,
                userId,
            },
        })
        count++
        if (count % 50 === 0) {
            console.log(`  ✓ Created ${count}/${transactions.length} transactions`)
        }
    }

    console.log(`✅ Created ${transactions.length} transactions`)
    return transactions.length
}

// ============================================
// BUDGET CREATION
// ============================================

async function createBudgets(userId: string, accounts: { [key: string]: string }) {
    console.log('📊 Creating budgets...')

    const currentYear = 2024
    const currentMonth = 9 // October (0-indexed)

    const budgets = [
        {
            name: 'Groceries Budget',
            amount: 5000,
            currency: Currency.EGP,
            accountIds: [accounts['Groceries']],
        },
        {
            name: 'Entertainment Budget',
            amount: 2000,
            currency: Currency.EGP,
            accountIds: [accounts['Entertainment']],
        },
        {
            name: 'Transportation Budget',
            amount: 1500,
            currency: Currency.EGP,
            accountIds: [accounts['Transportation']],
        },
        {
            name: 'Shopping Budget',
            amount: 3000,
            currency: Currency.EGP,
            accountIds: [accounts['Shopping'], accounts['Personal Care']],
        },
    ]

    for (const budgetData of budgets) {
        const startDate = new Date(currentYear, currentMonth, 1)
        const endDate = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59) // Last day of month

        const budget = await prisma.budget.create({
            data: {
                name: budgetData.name,
                amount: new Prisma.Decimal(budgetData.amount),
                currency: budgetData.currency,
                startDate,
                endDate,
                userId,
            },
        })

        // Link budget to accounts
        for (const accountId of budgetData.accountIds) {
            await prisma.budgetAccount.create({
                data: {
                    budgetId: budget.id,
                    accountId,
                },
            })
        }

        console.log(`  ✓ Created budget: ${budgetData.name}`)
    }

    console.log(`✅ Created ${budgets.length} budgets`)
}

// ============================================
// EXCHANGE RATES
// ============================================

async function createExchangeRates(userId: string) {
    console.log('💱 Creating exchange rates...')

    const rates = [
        { from: Currency.USD, to: Currency.EGP, rate: 30.5 },
        { from: Currency.EGP, to: Currency.USD, rate: 0.03278688524590164 },
    ]

    for (const rateData of rates) {
        await prisma.exchangeRate.create({
            data: {
                fromCurrency: rateData.from,
                toCurrency: rateData.to,
                rate: new Prisma.Decimal(rateData.rate),
                userId,
            },
        })
        console.log(`  ✓ Created exchange rate: ${rateData.from} → ${rateData.to} = ${rateData.rate}`)
    }

    console.log(`✅ Created ${rates.length} exchange rates`)
}

// ============================================
// MAIN SEED FUNCTION
// ============================================

async function main() {
    console.log('🌱 Starting seed script...\n')

    // Find existing user
    const user = await prisma.user.findFirst()

    if (!user) {
        console.error('❌ No user found in database. Please create a user first.')
        throw new Error('No user found in database')
    }

    console.log(`👤 Using existing user: ${user!.email} (ID: ${user!.id})`)
    console.log(`💰 Base currency: ${user!.baseCurrency}\n`)

    // Clean existing data
    await cleanExistingData(user!.id)
    console.log()

    // Create exchange rates
    await createExchangeRates(user!.id)
    console.log()

    // Create accounts
    const accounts = await createAccounts(user!.id)
    console.log()

    // Generate transactions
    const transactionCount = await generateTransactions(user!.id, accounts)
    console.log()

    // Create budgets
    await createBudgets(user!.id, accounts)
    console.log()

    console.log('✅ Seed script completed successfully!\n')
    console.log('Summary:')
    console.log(`  - User: ${user!.email}`)
    console.log(`  - Accounts: ${Object.keys(accounts).length}`)
    console.log(`  - Transactions: ${transactionCount}`)
    console.log(`  - Budgets: 4`)
    console.log(`  - Period: January 2024 - December 2024`)
    console.log(`  - Currencies: EGP (70%), USD (30%)`)
}

main()
    .catch((e) => {
        console.error('❌ Seed script failed:', e)
        throw e
    })
    .finally(async () => {
        await prisma.$disconnect()
    })

