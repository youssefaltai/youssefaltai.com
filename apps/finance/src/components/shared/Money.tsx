import { Text } from '@mantine/core'
import { formatCurrencyCompact } from '@repo/utils'
import type { Currency } from '@repo/types'

interface MoneyProps {
    amount: number
    currency: Currency
}

export function Money({ amount, currency }: MoneyProps) {
    return (
        <Text component="span">
            {formatCurrencyCompact(amount, currency)}
        </Text>
    )
}

