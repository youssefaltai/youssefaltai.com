'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { type LucideIcon } from 'lucide-react'
import { cn } from '@repo/utils'

export interface NavItem {
  name: string
  href: string
  icon: LucideIcon
}

interface BottomNavProps {
  items: NavItem[]
}

/**
 * iOS-style bottom navigation bar
 * Mobile-first design with tab bar pattern
 * 
 * @example
 * ```tsx
 * <BottomNav items={[
 *   { name: 'Home', href: '/', icon: Home },
 *   { name: 'Profile', href: '/profile', icon: User }
 * ]} />
 * ```
 */
export function BottomNav({ items }: BottomNavProps) {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-ios-gray-5 safe-area-inset-bottom z-30">
      <div className="flex justify-around items-center h-20 max-w-lg mx-auto px-2 pb-safe">
        {items.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors',
                isActive ? 'text-ios-blue' : 'text-ios-gray-1'
              )}
            >
              <Icon className="w-6 h-6" strokeWidth={isActive ? 2 : 1.5} />
              <span className={cn(
                'text-ios-caption',
                isActive ? 'font-medium' : 'font-normal'
              )}>
                {item.name}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

