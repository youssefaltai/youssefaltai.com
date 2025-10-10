'use client'

import { BarChart3, BottomNav, CreditCard, Home, NavItem, Target, User } from "@repo/ui"

const navItems: NavItem[] = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Transactions', href: '/transactions', icon: CreditCard },
  { name: 'Budgets', href: '/budgets', icon: BarChart3 },
  { name: 'Goals', href: '/goals', icon: Target },
  { name: 'Profile', href: '/profile', icon: User },
]

/**
 * Client component for bottom navigation
 * Separated to keep the main layout as server component
 */
export function AppBottomNav() {
  return <BottomNav items={navItems} />
}
