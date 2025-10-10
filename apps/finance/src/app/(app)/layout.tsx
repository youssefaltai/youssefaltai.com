'use client'

import { BottomNav, Home, CreditCard, BarChart3, Target, User } from '@repo/ui'

const navItems = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Transactions', href: '/transactions', icon: CreditCard },
  { name: 'Budgets', href: '/budgets', icon: BarChart3 },
  { name: 'Goals', href: '/goals', icon: Target },
  { name: 'Profile', href: '/profile', icon: User },
]

/**
 * Layout for authenticated app pages
 * Includes bottom navigation and page container
 */
export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-ios-gray-6">
      <div className="max-w-lg mx-auto pb-20">
        {children}
      </div>
      <BottomNav items={navItems} />
    </div>
  )
}

