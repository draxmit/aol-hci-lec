import { useState } from 'react'
import { AdvancedQueryBuilder } from '../components/transactions/AdvancedQueryBuilder'
import { TransactionTable } from '../components/transactions/TransactionTable'
import { SectionBadge } from '../components/ui/SectionBadge'
import { TRANSACTIONS } from '../lib/mock-data'
import { useReveal } from '../hooks/useReveal'
import type { Transaction } from '../lib/types'

interface Props { onOpenOmni: () => void }

export function TransactionsPage({ onOpenOmni }: Props) {
  const [rows] = useState<Transaction[]>(TRANSACTIONS)
  useReveal()
  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <SectionBadge>Transaction History</SectionBadge>
        <button onClick={onOpenOmni} className="glass-subtle rounded-full border px-4 py-1.5 transition-all duration-200" style={{ fontSize: 12, fontWeight: 500, fontFamily: "'Barlow', sans-serif", color: 'rgba(255,255,255,0.7)', borderColor: 'rgba(255,255,255,0.15)', cursor: 'pointer' }}>
          + Quick Add
        </button>
      </div>
      <AdvancedQueryBuilder />
      <TransactionTable transactions={rows} />
    </div>
  )
}
