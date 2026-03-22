import { UnifiedNetWorthBento } from '../components/dashboard/UnifiedNetWorthBento'
import { SpendingChart } from '../components/dashboard/SpendingChart'
import { PORTFOLIO, TRANSACTIONS } from '../lib/mock-data'
import { useReveal } from '../hooks/useReveal'

export function DashboardPage() {
  useReveal()
  return (
    <div className="flex flex-col gap-6">
      <UnifiedNetWorthBento portfolio={PORTFOLIO} recentTransactions={TRANSACTIONS} />
      <SpendingChart />
    </div>
  )
}
