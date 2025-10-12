/**
 * Currency utilities for the finance app
 */
import { Currency } from '@repo/db'

export const CURRENCY_OPTIONS = [Currency.EGP, Currency.USD, Currency.GOLD].map((code) => ({
    value: code,
    label: getCurrencyLabel(code),
}))

function getCurrencyLabel(code: Currency): string {
    switch (code) {
        case Currency.EGP:
            return 'Egyptian Pound (EGP)'
        case Currency.USD:
            return 'US Dollar (USD)'
        case Currency.GOLD:
            return 'Gold (grams)'
        default:
            return code
    }
}

