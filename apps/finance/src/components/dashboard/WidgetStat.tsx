import { ReactNode } from 'react'
import { Group, Text, Title } from '@mantine/core'
import { Money } from '../shared/Money'
import type { Currency } from '@repo/types'

/**
 * Widget stat display (for key metrics)
 */
export function WidgetStat({
  label,
  value,
  currency,
  change,
  changeType = 'neutral',
  icon,
}: {
  label: string
  value: number
  currency: Currency
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  icon?: ReactNode
}) {
  const changeColor = changeType === 'positive' ? 'green' : changeType === 'negative' ? 'red' : 'dimmed'
  
  return (
    <div>
      <Group gap="xs" mb={4}>
        {icon && <div style={{ opacity: 0.6 }}>{icon}</div>}
        <Text size="xs" c="dimmed">{label}</Text>
      </Group>
      <Group gap="xs">
        <Title order={4} size="h3">
          <Money amount={value} currency={currency} />
        </Title>
        {change && (
          <Text size="xs" fw={500} c={changeColor}>
            {change}
          </Text>
        )}
      </Group>
    </div>
  )
}

