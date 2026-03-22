import { useState } from 'react'
import { PurchaseIntelligence } from '../components/simulator/PurchaseIntelligence'
import { WhatIfSimulator }      from '../components/simulator/WhatIfSimulator'
import { useReveal } from '../hooks/useReveal'

type Tab = 'whatif' | 'impulse'

export function SimulatorPage() {
  useReveal()
  const [tab, setTab] = useState<Tab>('whatif')

  return (
    <div>
      {/* Top-level tab switcher */}
      <div style={{ display: 'flex', gap: 4, padding: 4, borderRadius: 14, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', width: 'fit-content', marginBottom: 24 }}>
        {([
          { id: 'whatif',  label: '📊  What-If Simulator' },
          { id: 'impulse', label: '🧠  Purchase Intelligence' },
        ] as { id: Tab; label: string }[]).map(({ id, label }) => (
          <button key={id} onClick={() => setTab(id)}
            style={{
              padding: '9px 20px', borderRadius: 10, fontSize: 13, fontWeight: 500,
              fontFamily: "'Barlow', sans-serif", cursor: 'pointer', border: 'none',
              background: tab === id ? 'rgba(255,255,255,0.1)' : 'transparent',
              color: tab === id ? '#fff' : 'rgba(255,255,255,0.4)',
              transition: 'all 0.2s',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'whatif'  && <WhatIfSimulator />}
      {tab === 'impulse' && <PurchaseIntelligence />}
    </div>
  )
}
