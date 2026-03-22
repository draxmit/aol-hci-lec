import { useState } from 'react'
import { GlassCard } from '../ui/GlassCard'
import type { Transaction } from '../../lib/types'
import { formatRp } from '../../lib/mock-data'

interface Props {
  transactions: Transaction[]
}

export function TransactionTable({ transactions: initial }: Props) {
  const [rows, setRows] = useState(initial)

  const verify = (id: string) => {
    setRows((prev) => prev.map((r) => r.id === id ? { ...r, needsReview: false } : r))
  }

  return (
    <GlassCard className="reveal overflow-hidden">
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr>
              {['Date', 'Description', 'Category', 'Amount', 'Source', 'Status'].map((h) => (
                <th
                  key={h}
                  style={{
                    textAlign: 'left', padding: '10px 14px',
                    color: 'rgba(255,255,255,0.35)', fontWeight: 500,
                    fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.7px',
                    borderBottom: '1px solid rgba(255,255,255,0.07)',
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((tx) => (
              <tr
                key={tx.id}
                style={{ transition: 'background 0.15s' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.025)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <td style={{ padding: '11px 14px', color: 'rgba(255,255,255,0.45)', borderBottom: '1px solid rgba(255,255,255,0.05)', whiteSpace: 'nowrap' }}>
                  {tx.date}
                </td>
                <td style={{ padding: '11px 14px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  {tx.description}
                </td>
                <td style={{ padding: '11px 14px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <span
                    className="glass-subtle rounded-full px-2.5 py-0.5"
                    style={{ fontSize: 11, whiteSpace: 'nowrap' }}
                  >
                    {tx.category}
                  </span>
                </td>
                <td style={{
                  padding: '11px 14px', fontWeight: 500,
                  color: tx.type === 'income' ? '#10b981' : tx.type === 'expense' ? '#f43f5e' : '#fff',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                }}>
                  {formatRp(tx.type === 'income' ? tx.amount : -tx.amount)}
                </td>
                <td style={{ padding: '11px 14px', color: 'rgba(255,255,255,0.45)', fontSize: 12, borderBottom: '1px solid rgba(255,255,255,0.05)', textTransform: 'capitalize' }}>
                  {tx.assetSourceId}
                </td>
                <td style={{ padding: '11px 14px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  {tx.needsReview ? (
                    <button
                      onClick={() => verify(tx.id)}
                      style={{
                        background: 'rgba(245,158,11,0.15)', color: '#f59e0b',
                        border: '1px solid rgba(245,158,11,0.3)', borderRadius: 9999,
                        padding: '2px 10px', fontSize: 11, cursor: 'pointer',
                        fontFamily: "'Barlow', sans-serif", transition: 'all 0.2s',
                      }}
                    >
                      AI Inferred · Review
                    </button>
                  ) : tx.isInferred ? (
                    <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11 }}>Verified</span>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </GlassCard>
  )
}
