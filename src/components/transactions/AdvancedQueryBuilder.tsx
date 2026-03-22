import { useState } from 'react'
import { GlassCard } from '../ui/GlassCard'

interface Condition {
  id: string
  field: string
  operator: string
  value: string
  conjunction: 'AND' | 'OR'
}

const FIELDS = ['Amount', 'Category', 'Date', 'Day of week', 'Source', 'Description']
const OPERATORS: Record<string, string[]> = {
  Amount:        ['greater than', 'less than', 'equals', 'between'],
  Category:      ['is', 'is not', 'in list'],
  Date:          ['in last N days', 'in last N months', 'between dates'],
  'Day of week': ['is weekday', 'is weekend', 'is Monday', 'is Friday', 'is Saturday'],
  Source:        ['is', 'is not'],
  Description:   ['contains', 'does not contain'],
}

let idCounter = 3

export function AdvancedQueryBuilder({ onQueryRun }: { onQueryRun?: () => void }) {
  const [conditions, setConditions] = useState<Condition[]>([
    { id: '1', field: 'Amount', operator: 'greater than', value: '500000', conjunction: 'AND' },
    { id: '2', field: 'Category', operator: 'is', value: 'Entertainment', conjunction: 'AND' },
  ])

  const addCondition = () => {
    setConditions((prev) => [...prev, { id: String(++idCounter), field: 'Amount', operator: 'greater than', value: '', conjunction: 'AND' }])
  }

  const removeCondition = (id: string) => setConditions((prev) => prev.filter((c) => c.id !== id))

  const update = (id: string, key: keyof Condition, val: string) => {
    setConditions((prev) => prev.map((c) => c.id === id ? { ...c, [key]: val } : c))
  }

  const inputStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8, color: '#fff', padding: '6px 10px',
    fontFamily: "'Barlow', sans-serif", fontSize: 12, outline: 'none', width: 120,
  }

  return (
    <GlassCard className="reveal p-5 mb-5">
      <div style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 }}>
        Query Builder
      </div>

      <div className="flex flex-col gap-2">
        {conditions.map((cond, idx) => (
          <div key={cond.id} className="flex items-center gap-2 flex-wrap">
            {idx === 0 ? (
              <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.3)', minWidth: 36, textAlign: 'center' }}>WHERE</span>
            ) : (
              <select value={cond.conjunction} onChange={(e) => update(cond.id, 'conjunction', e.target.value)} style={{ ...inputStyle, width: 70 }}>
                <option>AND</option><option>OR</option>
              </select>
            )}

            <select value={cond.field} onChange={(e) => update(cond.id, 'field', e.target.value)} style={{ ...inputStyle, width: 130 }}>
              {FIELDS.map((f) => <option key={f}>{f}</option>)}
            </select>

            <select value={cond.operator} onChange={(e) => update(cond.id, 'operator', e.target.value)} style={{ ...inputStyle, width: 140 }}>
              {(OPERATORS[cond.field] || OPERATORS['Amount']).map((op) => <option key={op}>{op}</option>)}
            </select>

            <input
              value={cond.value}
              onChange={(e) => update(cond.id, 'value', e.target.value)}
              placeholder="value"
              style={{ ...inputStyle }}
            />

            <button
              onClick={() => removeCondition(cond.id)}
              style={{ fontSize: 14, color: 'rgba(255,255,255,0.25)', background: 'none', border: 'none', cursor: 'pointer', padding: '0 4px', lineHeight: 1 }}
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <div className="flex gap-2.5 mt-4">
        <button
          onClick={addCondition}
          className="glass-subtle rounded-full border px-4 py-1.5 transition-all duration-200"
          style={{ fontSize: 12, fontWeight: 500, fontFamily: "'Barlow', sans-serif", color: 'rgba(255,255,255,0.7)', borderColor: 'rgba(255,255,255,0.15)', cursor: 'pointer' }}
        >
          + Add Condition
        </button>
        <button
          onClick={onQueryRun}
          className="rounded-full border-none px-5 py-1.5 transition-all duration-200"
          style={{ fontSize: 12, fontWeight: 600, fontFamily: "'Barlow', sans-serif", background: '#fff', color: '#000', cursor: 'pointer' }}
        >
          Run Query
        </button>
        <button
          className="glass-subtle rounded-full border px-4 py-1.5 transition-all duration-200"
          style={{ fontSize: 12, fontWeight: 500, fontFamily: "'Barlow', sans-serif", color: 'rgba(255,255,255,0.7)', borderColor: 'rgba(255,255,255,0.15)', cursor: 'pointer' }}
        >
          Save Query
        </button>
      </div>
    </GlassCard>
  )
}
