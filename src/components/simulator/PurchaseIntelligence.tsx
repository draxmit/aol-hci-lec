import { useState, useMemo, useRef, useEffect } from 'react'
import { GlassCard } from '../ui/GlassCard'
import { SectionBadge } from '../ui/SectionBadge'
import { TRANSACTIONS, formatRpAbs } from '../../lib/mock-data'
import {
  buildPersonalStats, buildFingerprint, scoreImpulse,
  type ImpulseResult, type ImpulseFingerprint,
} from '../../lib/impulse-engine'
import type { TransactionCategory } from '../../lib/types'

declare const Chart: any

const CATEGORIES: TransactionCategory[] = [
  'F&B', 'Transport', 'Entertainment', 'Shopping', 'Health', 'Bills & Utilities', 'Other'
]

const LABEL_COLOR: Record<string, string> = {
  low:       '#10b981',
  medium:    '#f59e0b',
  high:      '#f97316',
  'very high': '#f43f5e',
}

const LABEL_BG: Record<string, string> = {
  low:       'rgba(16,185,129,0.15)',
  medium:    'rgba(245,158,11,0.15)',
  high:      'rgba(249,115,22,0.15)',
  'very high': 'rgba(244,63,94,0.15)',
}

function ScoreRing({ score, label }: { score: number; label: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const color = LABEL_COLOR[label]

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const size = canvas.width
    const cx = size / 2, cy = size / 2, r = size * 0.38
    ctx.clearRect(0, 0, size, size)

    // Track
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.strokeStyle = 'rgba(255,255,255,0.08)'
    ctx.lineWidth = size * 0.07
    ctx.stroke()

    // Fill arc
    const startAngle = -Math.PI / 2
    const endAngle   = startAngle + Math.PI * 2 * score
    ctx.beginPath()
    ctx.arc(cx, cy, r, startAngle, endAngle)
    ctx.strokeStyle = color
    ctx.lineWidth = size * 0.07
    ctx.lineCap = 'round'
    ctx.stroke()

    // Score text
    ctx.fillStyle = '#fff'
    ctx.font = `700 ${size * 0.22}px Barlow`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(Math.round(score * 100).toString(), cx, cy - size * 0.04)
    ctx.font = `400 ${size * 0.10}px Barlow`
    ctx.fillStyle = 'rgba(255,255,255,0.45)'
    ctx.fillText('risk score', cx, cy + size * 0.13)
  }, [score, color])

  return <canvas ref={canvasRef} width={160} height={160} style={{ display: 'block' }} />
}

function RadarChart({ data }: { data: ImpulseFingerprint['radarData'] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const axes = [
    { key: 'lateNight',   label: 'Late Night' },
    { key: 'weekends',    label: 'Weekends'   },
    { key: 'overspend',   label: 'Overspend'  },
    { key: 'frequency',   label: 'Frequency'  },
    { key: 'dailyBudget', label: 'Daily Over' },
  ] as const

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const W = canvas.width, H = canvas.height
    const cx = W / 2, cy = H / 2
    const R = Math.min(W, H) * 0.37
    const n = axes.length
    ctx.clearRect(0, 0, W, H)

    const angleFor = (i: number) => (i / n) * Math.PI * 2 - Math.PI / 2

    // Grid rings
    for (let ring = 1; ring <= 4; ring++) {
      ctx.beginPath()
      for (let i = 0; i < n; i++) {
        const a = angleFor(i), r = R * (ring / 4)
        i === 0 ? ctx.moveTo(cx + r * Math.cos(a), cy + r * Math.sin(a))
                : ctx.lineTo(cx + r * Math.cos(a), cy + r * Math.sin(a))
      }
      ctx.closePath()
      ctx.strokeStyle = 'rgba(255,255,255,0.07)'
      ctx.lineWidth = 1
      ctx.stroke()
    }

    // Spokes
    axes.forEach((_, i) => {
      const a = angleFor(i)
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.lineTo(cx + R * Math.cos(a), cy + R * Math.sin(a))
      ctx.strokeStyle = 'rgba(255,255,255,0.07)'
      ctx.lineWidth = 1
      ctx.stroke()
    })

    // Data polygon
    ctx.beginPath()
    axes.forEach(({ key }, i) => {
      const a = angleFor(i), r = R * (data[key] as number)
      i === 0 ? ctx.moveTo(cx + r * Math.cos(a), cy + r * Math.sin(a))
              : ctx.lineTo(cx + r * Math.cos(a), cy + r * Math.sin(a))
    })
    ctx.closePath()
    ctx.fillStyle   = 'rgba(244,63,94,0.2)'
    ctx.strokeStyle = '#f43f5e'
    ctx.lineWidth   = 1.5
    ctx.fill()
    ctx.stroke()

    // Labels
    ctx.fillStyle = 'rgba(255,255,255,0.5)'
    ctx.font = '500 11px Barlow'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    axes.forEach(({ label }, i) => {
      const a = angleFor(i), r = R * 1.22
      ctx.fillText(label, cx + r * Math.cos(a), cy + r * Math.sin(a))
    })
  }, [data])

  return <canvas ref={canvasRef} width={220} height={220} style={{ display: 'block' }} />
}

function FeatureBar({ label, value, max = 1 }: { label: string; value: number; max?: number }) {
  const pct = Math.min(value / max, 1)
  const color = pct > 0.7 ? '#f43f5e' : pct > 0.45 ? '#f59e0b' : '#10b981'
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>
        <span>{label}</span>
        <span style={{ color: '#fff', fontWeight: 500 }}>{Math.round(pct * 100)}%</span>
      </div>
      <div style={{ height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.08)' }}>
        <div style={{ height: '100%', borderRadius: 2, width: `${pct * 100}%`, background: color, transition: 'width 0.6s ease' }} />
      </div>
    </div>
  )
}

const CONFIDENCE_LABEL: Record<string, string> = {
  cold:    'Generic model · Add more transactions to personalize',
  warming: 'Personalizing · Model learning your patterns',
  warm:    'Personalized model · Trained on your history',
}
const CONFIDENCE_COLOR: Record<string, string> = {
  cold: '#f59e0b', warming: '#3b82f6', warm: '#10b981',
}

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => {
  const h = i % 12 || 12, suffix = i < 12 ? 'AM' : 'PM'
  return { value: i, label: `${h}:00 ${suffix}` }
})
const DOW_OPTIONS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
  .map((label, value) => ({ value, label }))

export function PurchaseIntelligence() {
  const stats = useMemo(() => buildPersonalStats(TRANSACTIONS), [])
  const fingerprint = useMemo(() => buildFingerprint(TRANSACTIONS, stats), [stats])

  const [amount, setAmount]     = useState('')
  const [category, setCategory] = useState<TransactionCategory>('Shopping')
  const [hour, setHour]         = useState(new Date().getHours())
  const [dow, setDow]           = useState(new Date().getDay())
  const [result, setResult]     = useState<ImpulseResult | null>(null)
  const [analyzed, setAnalyzed] = useState(false)
  const [regretLog, setRegretLog] = useState<Array<{ desc: string; score: number }>>([])
  const [activeTab, setActiveTab] = useState<'check' | 'fingerprint' | 'log'>('check')

  const analyze = () => {
    const amt = parseFloat(amount.replace(/[^0-9.]/g, '')) * (amount.includes('jt') ? 1_000_000 : amount.includes('rb') || amount.includes('k') ? 1_000 : 1)
    if (!amt || isNaN(amt)) return
    const todaySpend = TRANSACTIONS
      .filter(t => t.type === 'expense' && t.dayOfWeek === dow)
      .reduce((s, t) => s + t.amount, 0)
    const lastCatIdx = [...TRANSACTIONS].reverse().findIndex(t => t.category === category && t.type === 'expense')
    const r = scoreImpulse(amt, category, hour, dow, todaySpend, stats, lastCatIdx, TRANSACTIONS.length)
    setResult(r)
    setAnalyzed(true)
  }

  const markRegret = () => {
    if (!result || !amount) return
    setRegretLog(prev => [{ desc: `${category} · ${amount}`, score: result.score }, ...prev])
    setResult(null); setAmount(''); setAnalyzed(false)
  }

  const inputStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10, color: '#fff', padding: '10px 14px',
    fontFamily: "'Barlow', sans-serif", fontSize: 14, outline: 'none', width: '100%',
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <SectionBadge>Purchase Intelligence</SectionBadge>
        <div style={{ display: 'flex', gap: 4, padding: 4, borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          {(['check', 'fingerprint', 'log'] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{
                padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 500,
                fontFamily: "'Barlow', sans-serif", cursor: 'pointer', border: 'none',
                background: activeTab === tab ? 'rgba(255,255,255,0.1)' : 'transparent',
                color: activeTab === tab ? '#fff' : 'rgba(255,255,255,0.4)',
              }}
            >
              {tab === 'check' ? 'Check Purchase' : tab === 'fingerprint' ? 'My Profile' : 'Regret Log'}
            </button>
          ))}
        </div>
      </div>

      {/* ── TAB: CHECK PURCHASE ───────────────────────────────────────────── */}
      {activeTab === 'check' && (
        <div style={{ display: 'grid', gridTemplateColumns: analyzed && result ? '1fr 1fr' : '480px', gap: 16, justifyContent: 'start' }}>

          {/* Input card */}
          <GlassCard className="p-6">
            {/* Model confidence banner */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
              borderRadius: 9999, background: 'rgba(255,255,255,0.04)',
              border: `1px solid ${CONFIDENCE_COLOR[stats.txCount < 10 ? 'cold' : stats.txCount < 20 ? 'warming' : 'warm']}40`,
              marginBottom: 20, fontSize: 11, color: 'rgba(255,255,255,0.55)',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: CONFIDENCE_COLOR[stats.txCount < 10 ? 'cold' : stats.txCount < 20 ? 'warming' : 'warm'], display: 'inline-block', flexShrink: 0 }} />
              {CONFIDENCE_LABEL[stats.txCount < 10 ? 'cold' : stats.txCount < 20 ? 'warming' : 'warm']}
              <span style={{ marginLeft: 'auto', fontWeight: 600, color: '#fff' }}>{stats.txCount} tx</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 6 }}>
                  Amount
                </label>
                <input
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="e.g. 350000 or 350rb or 2jt"
                  style={inputStyle}
                  onKeyDown={e => e.key === 'Enter' && analyze()}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 6 }}>Category</label>
                  <select value={category} onChange={e => setCategory(e.target.value as TransactionCategory)} style={{ ...inputStyle, padding: '10px 10px' }}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 6 }}>Time</label>
                  <select value={hour} onChange={e => setHour(Number(e.target.value))} style={{ ...inputStyle, padding: '10px 10px' }}>
                    {HOUR_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 6 }}>Day</label>
                <select value={dow} onChange={e => setDow(Number(e.target.value))} style={{ ...inputStyle, padding: '10px 10px' }}>
                  {DOW_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>

              <button
                onClick={analyze}
                style={{ background: '#fff', color: '#000', borderRadius: 9999, padding: '12px', fontFamily: "'Barlow', sans-serif", fontSize: 14, fontWeight: 600, cursor: 'pointer', border: 'none', marginTop: 4, transition: 'all 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.9)')}
                onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
              >
                Analyze Purchase
              </button>
            </div>
          </GlassCard>

          {/* Result card */}
          {analyzed && result && (
            <GlassCard className="p-6 reveal visible" style={{ borderColor: `${LABEL_COLOR[result.label]}30` }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, marginBottom: 20 }}>
                <ScoreRing score={result.score} label={result.label} />
                <div style={{ flex: 1 }}>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    background: LABEL_BG[result.label], color: LABEL_COLOR[result.label],
                    borderRadius: 9999, padding: '4px 12px', fontSize: 12, fontWeight: 600, marginBottom: 10,
                  }}>
                    {result.label.toUpperCase()} IMPULSE RISK
                  </div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>
                    Model confidence:
                    <span style={{ color: CONFIDENCE_COLOR[result.confidence], fontWeight: 600, marginLeft: 4 }}>
                      {result.confidence}
                    </span>
                  </div>

                  {result.shouldSleepOn && (
                    <div style={{
                      background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)',
                      borderRadius: 10, padding: '10px 12px', fontSize: 12,
                      color: '#f59e0b', marginBottom: 10,
                    }}>
                      🌙 Sleep on it — wait 24h before buying
                    </div>
                  )}

                  <div style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Triggers</div>
                  {result.triggers.map((t, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'rgba(255,255,255,0.7)', marginBottom: 4 }}>
                      <span style={{ width: 4, height: 4, borderRadius: '50%', background: LABEL_COLOR[result.label], display: 'inline-block', flexShrink: 0 }} />
                      {t}
                    </div>
                  ))}
                </div>
              </div>

              {/* Feature bars */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 16, marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Feature Breakdown</div>
                <FeatureBar label="Amount vs your baseline" value={Math.max(0, result.features.amountZScore) / 4} />
                <FeatureBar label="Time of day risk"         value={result.features.hourRisk} />
                <FeatureBar label="Day of week pattern"      value={result.features.dowRisk} />
                <FeatureBar label="Category frequency"       value={result.features.frequencyRisk} />
                <FeatureBar label="Daily budget pressure"    value={result.features.dailyBudgetRisk} />
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => { setResult(null); setAnalyzed(false) }}
                  style={{ flex: 1, background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 9999, padding: '10px', fontFamily: "'Barlow', sans-serif", fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}
                >
                  Bought it anyway
                </button>
                <button onClick={markRegret}
                  style={{ flex: 1, background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)', borderRadius: 9999, padding: '10px', fontFamily: "'Barlow', sans-serif", fontSize: 12, fontWeight: 500, color: '#f43f5e', cursor: 'pointer' }}
                >
                  Log as regret ↺
                </button>
              </div>
            </GlassCard>
          )}
        </div>
      )}

      {/* ── TAB: FINGERPRINT ─────────────────────────────────────────────── */}
      {activeTab === 'fingerprint' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <GlassCard className="p-6 reveal">
            <div style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>
              Impulse Fingerprint
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
              <RadarChart data={fingerprint.radarData} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { label: 'Peak impulse hour', val: `${fingerprint.topImpulseHour}:00` },
                { label: 'Riskiest day',      val: fingerprint.topImpulseDay },
                { label: 'Top category',      val: fingerprint.topImpulseCategory },
                { label: 'Flagged purchases', val: String(fingerprint.totalFlagged) },
              ].map(({ label, val }) => (
                <div key={label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '12px 14px' }}>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>{val}</div>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-6 reveal" style={{ transitionDelay: '0.1s' }}>
            <div style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>
              Model Status
            </div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
                <span style={{ color: 'rgba(255,255,255,0.5)' }}>Transactions analyzed</span>
                <span style={{ fontWeight: 600 }}>{stats.txCount}</span>
              </div>
              <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.08)', marginBottom: 4 }}>
                <div style={{ height: '100%', borderRadius: 2, background: CONFIDENCE_COLOR[stats.txCount < 10 ? 'cold' : stats.txCount < 20 ? 'warming' : 'warm'], width: `${Math.min(stats.txCount / 100 * 100, 100)}%`, transition: 'width 0.8s ease' }} />
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>Full personalization at 100 transactions</div>
            </div>

            <div style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
              Category Baselines
            </div>
            {Object.entries(stats.categoryMeans).slice(0, 5).map(([cat, avg]) => (
              <div key={cat} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 8 }}>
                <span style={{ color: 'rgba(255,255,255,0.5)' }}>{cat}</span>
                <span style={{ fontWeight: 500 }}>{formatRpAbs(avg as number)} avg</span>
              </div>
            ))}

            <div style={{ marginTop: 16, padding: '12px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
              Model retrains automatically as you add transactions and log regrets. The more you use it, the sharper it gets.
            </div>
          </GlassCard>
        </div>
      )}

      {/* ── TAB: REGRET LOG ──────────────────────────────────────────────── */}
      {activeTab === 'log' && (
        <GlassCard className="p-6 reveal">
          <div style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>
            Regret Log
          </div>
          {regretLog.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0', color: 'rgba(255,255,255,0.25)', fontSize: 14 }}>
              No regrets logged yet.<br />
              <span style={{ fontSize: 12 }}>Analyze a purchase and mark it as a regret to start training the model.</span>
            </div>
          ) : (
            regretLog.map((entry, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{entry.desc}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>Model score at time: {Math.round(entry.score * 100)}</div>
                </div>
                <span style={{ background: 'rgba(244,63,94,0.15)', color: '#f43f5e', borderRadius: 9999, padding: '2px 10px', fontSize: 11, fontWeight: 600 }}>
                  REGRET
                </span>
              </div>
            ))
          )}
        </GlassCard>
      )}
    </div>
  )
}
