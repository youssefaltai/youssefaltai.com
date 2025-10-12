/**
 * Zod refinement: Validates that fromAccountId and toAccountId are different.
 * Prevents same-account transfers.
 * 
 * @param onlyIfBothProvided - If true, only validates when both fields are present (for updates)
 */
export function differentAccountsRefinement<T extends { fromAccountId?: string; toAccountId?: string }>(
    onlyIfBothProvided = false
) {
    return (data: T) => {
        if (onlyIfBothProvided) {
            // For updates: only validate if both are provided
            if (data.fromAccountId && data.toAccountId) {
                return data.fromAccountId !== data.toAccountId
            }
            return true
        }

        // For creates: both must be provided and different
        return data.fromAccountId !== data.toAccountId
    }
}

/**
 * Zod refinement: Validates that currency is provided when exchangeRate is provided.
 * Ensures data consistency for cross-currency transactions.
 */
export function currencyRequiredWithExchangeRateRefinement<
    T extends { currency?: string; exchangeRate?: number }
>() {
    return (data: T) => {
        if (data.exchangeRate !== undefined && !data.currency) {
            return false
        }
        return true
    }
}

/**
 * Creates a Zod schema refinement configuration for different accounts validation.
 * 
 * @param onlyIfBothProvided - Whether to only validate when both fields are present
 */
export function withDifferentAccountsValidation(onlyIfBothProvided = false) {
    return {
        message: "From and to accounts must be different",
        path: ["toAccountId"] as const,
        refinement: differentAccountsRefinement(onlyIfBothProvided),
    }
}

/**
 * Creates a Zod schema refinement configuration for currency requirement validation.
 */
export function withCurrencyRequiredValidation() {
    return {
        message: "Currency is required when exchange rate is provided",
        path: ["currency"] as const,
        refinement: currencyRequiredWithExchangeRateRefinement(),
    }
}

