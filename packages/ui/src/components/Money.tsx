import { formatCurrencyCompact } from '@repo/utils'
import type { Currency } from '@repo/types'
import { cn } from '@repo/utils'

interface MoneyProps {
    /**
     * The monetary amount to display
     * Can be a number, string, or Prisma Decimal
     */
    amount: number

    /**
     * The currency code (EGP, USD, GOLD, etc.)
     */
    currency: Currency

    /**
     * Optional className for styling
     */
    className?: string
}

/**
 * Money component
 * Displays monetary values with consistent compact formatting (K, M, B notation)
 * 
 * @example
 * <Money amount={1500000} currency="EGP" className="text-2xl font-bold" />
 * // Displays: E£1.5M
 * 
 * <Money amount={account.balance} currency={account.currency} />
 * // Displays formatted balance with appropriate currency symbol
 */
export function Money({ amount, currency, className }: MoneyProps) {
    return (
        <span className={cn(className)}>
            {formatCurrencyCompact(amount, currency)}
        </span>
    )
}

