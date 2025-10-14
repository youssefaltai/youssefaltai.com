'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Box, Group, UnstyledButton, Stack, Text } from '@mantine/core'
import { BarChart3, CreditCard, Home, Target, MoreHorizontal } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface NavItem {
  name: string
  href: string
  icon: LucideIcon
}

const navItems: NavItem[] = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Transactions', href: '/transactions', icon: CreditCard },
  { name: 'Goals', href: '/goals', icon: Target },
  { name: 'Budgets', href: '/budgets', icon: BarChart3 },
  { name: 'More', href: '/more', icon: MoreHorizontal },
]

/**
 * Client component for bottom navigation
 * Separated to keep the main layout as server component
 */
export function AppBottomNav() {
  const pathname = usePathname()

  return (
    <Box
      component="nav"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        borderTop: '1px solid var(--mantine-color-gray-3)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        zIndex: 50,
      }}
    >
      <Group gap={0} grow style={{ height: '64px' }}>
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <UnstyledButton
              key={item.href}
              component={Link}
              href={item.href}
              style={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Stack align="center" gap={4}>
                <Icon 
                  size={24} 
                  color={isActive ? 'var(--mantine-color-blue-6)' : 'var(--mantine-color-gray-6)'}
                  fill={isActive ? 'currentColor' : 'none'}
                  strokeWidth={2}
                />
                <Text 
                  size="10px" 
                  fw={500}
                  c={isActive ? 'blue' : 'dimmed'}
                >
                  {item.name}
                </Text>
              </Stack>
            </UnstyledButton>
          )
        })}
      </Group>
    </Box>
  )
}
