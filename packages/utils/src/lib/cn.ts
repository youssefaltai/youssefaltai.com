/**
 * Utility function to conditionally join classNames
 * Simple implementation following minimalism principle
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

