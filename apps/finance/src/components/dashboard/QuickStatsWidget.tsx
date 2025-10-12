'use client'

import { DashboardWidget, WidgetStat } from './DashboardWidget'
import { useDashboardSummary } from '../../hooks/use-dashboard'
import { useAccounts } from '../../hooks/use-accounts'
import { Wallet, CreditCard, TrendingUp, PiggyBank } from '@repo/ui'
import { convertAmount, ExchangeRateMap } from '../../shared/finance-utils'
import { useExchangeRates } from '../../hooks/use-exchange-rates'
import { calculateCreditUtilization } from '../../utils/calculations'

/**
 * Quick stats widget
 * Shows key financial metrics at a glance
 */
export function QuickStatsWidget() {
  const { data: summary, isLoading: summaryLoading } = useDashboardSummary()
  const { data: accounts, isLoading: accountsLoading } = useAccounts()
  const { data: rates } = useExchangeRates()

  const isLoading = summaryLoading || accountsLoading

  // Calculate stats
  const baseCurrency = 'EGP' // TODO: Get from user profile

  // Build rate map
  const rateMap: ExchangeRateMap = new Map()
  if (rates) {
    for (const rate of rates) {
      const key = `${rate.fromCurrency}_TO_${rate.toCurrency}`
      rateMap.set(key, rate.rate)
    }
  }

  // Liquid assets (cash, bank accounts)
  const liquidAssets =
    accounts
      ?.filter((acc) => acc.type === 'asset')
      .reduce((sum, acc) => {
        try {
          return sum + Number(convertAmount(acc.balance, acc.currency, baseCurrency, rateMap))
        } catch {
          return sum
        }
      }, 0) || 0

  // Total debt
  const totalDebt =
    accounts
      ?.filter((acc) => acc.type === 'liability')
      .reduce((sum, acc) => {
        try {
          return sum + Number(convertAmount(acc.balance, acc.currency, baseCurrency, rateMap))
        } catch {
          return sum
        }
      }, 0) || 0

  // Average credit utilization
  const creditCards = accounts?.filter((acc) => acc.type === 'liability' && acc.target) || []
  const avgUtilization =
    creditCards.length > 0
      ? creditCards.reduce((sum, card) => {
          if (!card.target) return sum
          return sum + calculateCreditUtilization(Number(card.balance), Number(card.target))
        }, 0) / creditCards.length
      : 0

  // Savings this month
  const savings = (summary?.thisMonthIncome || 0) - (summary?.thisMonthExpenses || 0)

  return (
    <DashboardWidget
      title="Quick Stats"
      subtitle="Key metrics at a glance"
      loading={isLoading}
    >
      <div className="grid grid-cols-2 gap-4">
        <WidgetStat
          label="Liquid Assets"
          value={liquidAssets}
          currency={baseCurrency}
          icon={<Wallet className="w-4 h-4" />}
        />
        <WidgetStat
          label="Total Debt"
          value={totalDebt}
          currency={baseCurrency}
          icon={<CreditCard className="w-4 h-4" />}
        />
        <WidgetStat
          label="Credit Utilization"
          value={avgUtilization}
          currency='EGP'
          changeType={avgUtilization > 70 ? 'negative' : avgUtilization < 30 ? 'positive' : 'neutral'}
          icon={<TrendingUp className="w-4 h-4" />}
        />
        <WidgetStat
          label="Monthly Savings"
          value={savings}
          currency={baseCurrency}
          changeType={savings > 0 ? 'positive' : savings < 0 ? 'negative' : 'neutral'}
          icon={<PiggyBank className="w-4 h-4" />}
        />
      </div>
    </DashboardWidget>
  )
}

