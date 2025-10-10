'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { type LucideIcon } from 'lucide-react'

export interface NavItem {
  name: string
  href: string
  icon: LucideIcon
}

interface BottomNavProps {
  items: NavItem[]
}

export function BottomNav({ items }: BottomNavProps) {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-ios-gray-5 h-16 pb-safe">
      <div className="flex h-full">
        {items.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full ${
                isActive ? 'text-ios-blue' : 'text-ios-gray-1'
              }`}
            >
              <Icon className="w-6 h-6 mb-1" />
              <span className="text-[12px] font-medium leading-[16px]">
                {item.name}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

