/**
 * React Hook Form setValueAs transformer for optional string fields
 * Converts empty strings to undefined so they pass Zod's .optional() validation
 * 
 * Usage:
 * ```tsx
 * {...register('currency', { setValueAs: emptyStringToUndefined })}
 * ```
 */
export function emptyStringToUndefined(value: string): string | undefined {
  return value === '' ? undefined : value
}

/**
 * React Hook Form setValueAs transformer for optional number fields
 * Converts empty strings, null, and NaN to undefined so they pass Zod's .optional() validation
 * 
 * Usage:
 * ```tsx
 * {...register('exchangeRate', { setValueAs: emptyNumberToUndefined })}
 * ```
 */
export function emptyNumberToUndefined(value: string | number | null): number | undefined {
  if (value === '' || value === null) return undefined
  const num = Number(value)
  return isNaN(num) ? undefined : num
}

