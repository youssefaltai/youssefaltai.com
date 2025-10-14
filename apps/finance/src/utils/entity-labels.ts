import { AccountType } from '@repo/db'
import type { LucideIcon } from 'lucide-react'
import {
  Wallet,
  CreditCard,
  Landmark,
  Target,
  TrendingUp,
  TrendingDown,
} from 'lucide-react'

/**
 * Get user-friendly label for entity type
 * NEVER exposes "Account" terminology to users
 */
export function getEntityTypeLabel(type: AccountType): string {
  switch (type) {
    case 'asset':
      return 'Assets'
    case 'liability':
      return 'Loans' // Liability accounts shown as "Loans"
    case 'income':
      return 'Income Sources'
    case 'expense':
      return 'Expense Categories'
    case 'equity':
      return 'Equity' // Rare, used for opening balance
    default:
      return 'Items'
  }
}

/**
 * Get singular form of entity type label
 */
export function getEntityTypeLabelSingular(type: AccountType): string {
  switch (type) {
    case 'asset':
      return 'Asset'
    case 'liability':
      return 'Loan'
    case 'income':
      return 'Income Source'
    case 'expense':
      return 'Expense Category'
    case 'equity':
      return 'Equity'
    default:
      return 'Item'
  }
}

/**
 * Get icon for entity type
 */
export function getEntityTypeIcon(type: AccountType): LucideIcon {
  switch (type) {
    case 'asset':
      return Wallet
    case 'liability':
      return Landmark
    case 'income':
      return TrendingUp
    case 'expense':
      return TrendingDown
    case 'equity':
      return Wallet
    default:
      return Wallet
  }
}

/**
 * Get route path for entity type
 */
export function getEntityTypePath(type: AccountType): string {
  switch (type) {
    case 'asset':
      return '/assets'
    case 'liability':
      return '/loans'
    case 'income':
      return '/income-sources'
    case 'expense':
      return '/expense-categories'
    default:
      return '/more'
  }
}

/**
 * Get special entity type labels (for specific subtypes)
 */
export function getSpecialEntityLabel(name: string): string {
  // Check if this is a credit card (convention: liability with "card" in name)
  if (name.toLowerCase().includes('card')) {
    return 'Credit Card'
  }
  
  // Check if this is a goal (convention: asset with target amount)
  // This will be determined by checking if target field exists
  return name
}

/**
 * Get icon for credit cards
 */
export function getCreditCardIcon(): LucideIcon {
  return CreditCard
}

/**
 * Get icon for goals
 */
export function getGoalIcon(): LucideIcon {
  return Target
}

/**
 * Get empty state message for entity type
 */
export function getEmptyStateMessage(type: AccountType): string {
  switch (type) {
    case 'asset':
      return 'No assets tracked yet. Add your first asset to get started!'
    case 'liability':
      return 'No loans tracked yet.'
    case 'income':
      return 'No income sources added yet.'
    case 'expense':
      return 'No expense categories created yet.'
    default:
      return 'No items yet.'
  }
}

/**
 * Get add button label for entity type
 */
export function getAddButtonLabel(type: AccountType): string {
  switch (type) {
    case 'asset':
      return 'Add Asset'
    case 'liability':
      return 'Add Loan'
    case 'income':
      return 'Add Income Source'
    case 'expense':
      return 'Add Category'
    default:
      return 'Add Item'
  }
}

