import { useState } from 'react'
import { SectionBadge } from '../ui/SectionBadge'
import type { BehavioralInsight } from '../../lib/types'
import { formatRpAbs } from '../../lib/mock-data'

interface Props {
  insights: BehavioralInsight[]
}

export function BehavioralInsightsCard({ insights: initialInsights }: Props) {
  const [insights, setInsights] = useState(initialInsights)

  const dismiss = (id: string) => setInsights((prev) => prev.filter((i) => i.id !== id))

  const severityStyle = (sev: string): React.CSSProperties =>
    sev === 'critical'
      ? { borderColor: 'rgba(244,63,94,0.3)', boxShadow: '0 0 0 1px rgba(244,63,94,0.18)' }
      : { borderColor: 'rgba(245,158,11,0.25)', boxShadow: '0 0 0 1px rgba(245,158,11,0.13)' }

  const probColor = (prob: number) => (prob >= 0.8 ? '#f43f5e' : '#f59e0b')

  if (insights.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>
        No patterns detected yet. Add more transactions to unlock insights.
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <SectionBadge color="amber">
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }} />
          Behavioral Insights
        </SectionBadge>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{insights.length} active warning{insights.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="flex flex-col gap-3">
        {insights.map((ins) => (
          <div
            key={ins.id}
            className="glass-subtle reveal rounded-2xl border p-5 transition-all duration-300"
            style={severityStyle(ins.severity)}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <span
                  className="inline-flex items-center rounded-full px-2.5 py-0.5"
                  style={{ fontSize: 11, fontWeight: 600, background: ins.severity === 'critical' ? 'rgba(244,63,94,0.15)' : 'rgba(245,158,11,0.15)', color: probColor(ins.probability) }}
                >
                  {Math.round(ins.probability * 100)}%
                </span>
                <span
                  className="glass-subtle inline-flex items-center rounded-full px-2.5 py-0.5"
                  style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}
                >
                  {ins.affectedCategory}
                </span>
              </div>
              <button
                onClick={() => dismiss(ins.id)}
                className="glass-subtle rounded-full border px-3 py-1 transition-all duration-200"
                style={{ fontSize: 11, fontFamily: "'Barlow', sans-serif", color: 'rgba(255,255,255,0.5)', borderColor: 'rgba(255,255,255,0.1)', cursor: 'pointer' }}
              >
                Dismiss
              </button>
            </div>

            <h3 style={{ fontSize: 18, letterSpacing: -1, margin: '8px 0 4px' }}>{ins.title}</h3>

            {/* Probability bar */}
            <div style={{ height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.08)', overflow: 'hidden', margin: '8px 0 12px' }}>
              <div
                style={{
                  height: '100%', borderRadius: 2,
                  width: `${ins.probability * 100}%`,
                  background: probColor(ins.probability),
                  transition: 'width 1s ease',
                }}
              />
            </div>

            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.65 }}>{ins.description}</p>

            <div style={{ marginTop: 10, fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
              Avg: {formatRpAbs(ins.historicalAverage)} · CI: [{Math.round(ins.confidenceInterval[0] * 100)}%, {Math.round(ins.confidenceInterval[1] * 100)}%]
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
