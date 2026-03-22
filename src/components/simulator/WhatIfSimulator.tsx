import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer,
} from 'recharts'
import { GlassCard } from '../ui/GlassCard'
import { SectionBadge } from '../ui/SectionBadge'
import { GOALS, RICH_TRANSACTIONS, formatRpAbs } from '../../lib/mock-data'
import { buildDayCashFlows, runSimulation } from '../../lib/whatif-engine'
import type { SimulationResult } from '../../lib/types'

const LIQUID_BALANCE = 156_200_000  // BCA Savings — the liquid "everyday" balance

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  const expected  = payload.find((p: any) => p.dataKey === 'expectedBalance')?.value
  const upper     = payload.find((p: any) => p.dataKey === 'upperBound')?.value
  const lower     = payload.find((p: any) => p.dataKey === 'lowerBound')?.value
  return (
    <div style={{
      background: 'rgba(0,0,0,0.92)', border: '1px solid rgba(255,255,255,0.12)',
      borderRadius: 10, padding: '10px 14px', fontSize: 12,
    }}>
      <div style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 6, fontWeight: 500 }}>{label}</div>
      {expected != null && <div style={{ color: '#fff',    marginBottom: 3 }}>Expected: <b>{formatRpAbs(expected)}</b></div>}
      {upper    != null && <div style={{ color: '#10b981', marginBottom: 3 }}>p75:  {formatRpAbs(upper)}</div>}
      {lower    != null && <div style={{ color: lower < 0 ? '#f43f5e' : '#f59e0b' }}>p25:  {formatRpAbs(lower)}</div>}
    </div>
  )
}

// ─── Goal progress arc ────────────────────────────────────────────────────────
function GoalArc({ pct, size = 36 }: { pct: number; size?: number }) {
  const r = size * 0.38
  const circ = 2 * Math.PI * r
  const dash = circ * Math.min(pct, 1)
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={size * 0.1} />
      <circle cx={size/2} cy={size/2} r={r} fill="none"
        stroke={pct >= 1 ? '#10b981' : '#f59e0b'} strokeWidth={size * 0.1}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.6s ease' }}
      />
    </svg>
  )
}

// ─── Animated counter ─────────────────────────────────────────────────────────
function useAnimatedValue(target: number, duration = 400) {
  const [display, setDisplay] = useState(target)
  const rafRef = useRef<number>()
  useEffect(() => {
    const start = display
    const startTime = performance.now()
    const tick = (now: number) => {
      const p = Math.min((now - startTime) / duration, 1)
      const ease = 1 - Math.pow(1 - p, 3)
      setDisplay(start + (target - start) * ease)
      if (p < 1) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [target])
  return display
}

// ─── Day slider labels ────────────────────────────────────────────────────────
function dayLabel(offset: number): string {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  return offset === 0 ? 'Today' : offset === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function WhatIfSimulator() {
  const [amount, setAmount]         = useState(2_000_000)
  const [dayOffset, setDayOffset]   = useState(0)
  const [prevResult, setPrevResult] = useState<SimulationResult | null>(null)
  const [alertVisible, setAlertVisible] = useState(false)

  const dayCashFlows = useMemo(() => buildDayCashFlows(RICH_TRANSACTIONS), [])

  const result = useMemo<SimulationResult>(() => {
    return runSimulation(LIQUID_BALANCE, amount, dayOffset, dayCashFlows, GOALS)
  }, [amount, dayOffset, dayCashFlows])

  // Detect when delayed goals appear → trigger alert animation
  useEffect(() => {
    const hadDelays = (prevResult?.delayedGoals.length ?? 0) === 0 && result.delayedGoals.length > 0
    if (hadDelays) {
      setAlertVisible(false)
      requestAnimationFrame(() => setAlertVisible(true))
    } else {
      setAlertVisible(result.delayedGoals.length > 0)
    }
    setPrevResult(result)
  }, [result])

  const animatedOverdraft = useAnimatedValue(result.overdraftRisk * 100)
  const animatedMin       = useAnimatedValue(result.minBalance)

  // Build chart data — gradient logic: mark zones where lowerBound < 0
  const chartData = result.projections.map(p => ({
    ...p,
    // Recharts area needs separate keys for positive/negative shading
    lowerBoundPos: Math.max(p.lowerBound, 0),
    lowerBoundNeg: Math.min(p.lowerBound, 0),
    purchaseLine:  undefined as number | undefined,
  }))
  // Mark purchase day
  if (chartData[dayOffset]) chartData[dayOffset].purchaseLine = chartData[dayOffset].expectedBalance

  const hasNegativeZone = result.projections.some(p => p.lowerBound < 0)
  const overdraftColor  = result.overdraftRisk > 0.25 ? '#f43f5e' : result.overdraftRisk > 0.08 ? '#f59e0b' : '#10b981'

  const formatMillions = (v: number) => {
    if (Math.abs(v) >= 1_000_000) return `${(v / 1_000_000).toFixed(0)}jt`
    return `${Math.round(v / 1000)}k`
  }

  const sliderPercent = (amount / 20_000_000) * 100

  return (
    <div className="flex flex-col gap-5">

      {/* ── Optimal date recommendation banner ─────────────────────────────── */}
      {result.optimalDateRecommendation && (
        <div
          style={{
            display: 'flex', alignItems: 'flex-start', gap: 12,
            padding: '14px 18px', borderRadius: 14,
            background: 'rgba(59,130,246,0.1)',
            border: '1px solid rgba(59,130,246,0.25)',
            animation: 'fadeSlideDown 0.4s ease both',
          }}
        >
          <span style={{ fontSize: 18, flexShrink: 0 }}>💡</span>
          <div style={{ fontSize: 13, lineHeight: 1.6 }}>
            <span style={{ color: '#fff', fontWeight: 500 }}>
              Tip: Waiting until {result.optimalDateRecommendation.date} reduces your overdraft risk by{' '}
              <span style={{ color: '#3b82f6', fontWeight: 700 }}>
                {result.optimalDateRecommendation.overdraftRiskReduction}%
              </span>.
            </span>
            <span style={{ color: 'rgba(255,255,255,0.5)', marginLeft: 6 }}>
              {result.optimalDateRecommendation.reason}
            </span>
          </div>
        </div>
      )}

      {/* ── Main bento grid ─────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 16, alignItems: 'start' }}>

        {/* Left: Input controls */}
        <div className="flex flex-col gap-4">
          <GlassCard className="p-5">
            <div style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 20 }}>
              What-If Purchase
            </div>

            {/* Amount slider */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 10 }}>
                <span>Purchase Amount</span>
                <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontSize: 22, letterSpacing: -1, color: '#fff', lineHeight: 1 }}>
                  {formatRpAbs(amount)}
                </span>
              </div>
              {/* Custom slider track with fill */}
              <div style={{ position: 'relative', height: 20, display: 'flex', alignItems: 'center' }}>
                <div style={{ position: 'absolute', left: 0, right: 0, height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.1)' }}>
                  <div style={{ width: `${sliderPercent}%`, height: '100%', borderRadius: 2, background: 'rgba(255,255,255,0.5)', transition: 'width 0.05s' }} />
                </div>
                <input type="range" min={0} max={20_000_000} step={100_000} value={amount}
                  onChange={e => setAmount(Number(e.target.value))}
                  style={{ position: 'absolute', width: '100%', opacity: 0, cursor: 'pointer', height: 20 }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'rgba(255,255,255,0.25)', marginTop: 4 }}>
                <span>Rp 0</span><span>Rp 20jt</span>
              </div>
            </div>

            {/* Purchase date slider */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 10 }}>
                <span>When to buy</span>
                <span style={{ color: '#fff', fontWeight: 500 }}>{dayLabel(dayOffset)}</span>
              </div>
              <div style={{ position: 'relative', height: 20, display: 'flex', alignItems: 'center' }}>
                <div style={{ position: 'absolute', left: 0, right: 0, height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.1)' }}>
                  <div style={{ width: `${(dayOffset / 29) * 100}%`, height: '100%', borderRadius: 2, background: 'rgba(255,255,255,0.5)', transition: 'width 0.05s' }} />
                </div>
                <input type="range" min={0} max={29} step={1} value={dayOffset}
                  onChange={e => setDayOffset(Number(e.target.value))}
                  style={{ position: 'absolute', width: '100%', opacity: 0, cursor: 'pointer', height: 20 }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'rgba(255,255,255,0.25)', marginTop: 4 }}>
                <span>Today</span><span>+30 days</span>
              </div>
            </div>

            {/* Stat cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                {
                  label: 'Overdraft Risk',
                  value: `${animatedOverdraft.toFixed(0)}%`,
                  color: overdraftColor,
                  sub: '500 simulations',
                },
                {
                  label: 'Min Balance',
                  value: formatRpAbs(animatedMin),
                  color: animatedMin < 0 ? '#f43f5e' : '#10b981',
                  sub: 'p25 worst case',
                },
                {
                  label: 'Savings Rate Δ',
                  value: `${result.impactOnSavingsRate.toFixed(1)}%`,
                  color: result.impactOnSavingsRate < -10 ? '#f43f5e' : result.impactOnSavingsRate < 0 ? '#f59e0b' : '#10b981',
                  sub: '30-day impact',
                },
                {
                  label: 'Goals Affected',
                  value: String(result.delayedGoals.length),
                  color: result.delayedGoals.length > 0 ? '#f43f5e' : '#10b981',
                  sub: result.delayedGoals.length > 0 ? 'see below' : 'on track',
                },
              ].map(({ label, value, color, sub }) => (
                <div key={label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '12px 14px' }}>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color, fontVariantNumeric: 'tabular-nums', transition: 'color 0.3s' }}>{value}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>{sub}</div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Goals panel */}
          <GlassCard className="p-5">
            <div style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 }}>
              Your Goals
            </div>
            {GOALS.map(goal => {
              const pct = goal.currentAmount / goal.targetAmount
              return (
                <div key={goal.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <GoalArc pct={pct} size={36} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 500, display: 'flex', gap: 6 }}>
                      <span>{goal.icon}</span>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{goal.name}</span>
                    </div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>
                      {formatRpAbs(goal.currentAmount)} / {formatRpAbs(goal.targetAmount)}
                    </div>
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: pct >= 1 ? '#10b981' : 'rgba(255,255,255,0.5)', whiteSpace: 'nowrap' }}>
                    {Math.round(pct * 100)}%
                  </div>
                </div>
              )
            })}
          </GlassCard>
        </div>

        {/* Right: Chart + alerts */}
        <div className="flex flex-col gap-4">
          <GlassCard className="p-5">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
                  30-Day Balance Projection
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                  Shaded band = p25–p75 confidence interval · 500 Monte Carlo paths
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, fontSize: 11 }}>
                {[
                  { color: '#10b981', label: 'Expected (p50)' },
                  { color: hasNegativeZone ? '#f43f5e' : 'rgba(255,255,255,0.2)', label: 'Confidence band', dashed: false, fill: true },
                ].map(({ color, label, fill }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'rgba(255,255,255,0.45)' }}>
                    {fill
                      ? <span style={{ width: 14, height: 8, background: color, borderRadius: 2, opacity: 0.5, display: 'inline-block' }} />
                      : <span style={{ width: 14, height: 2, background: color, display: 'inline-block' }} />
                    }
                    {label}
                  </div>
                ))}
              </div>
            </div>

            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="bandGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor={hasNegativeZone ? '#f43f5e' : '#10b981'} stopOpacity={0.25} />
                    <stop offset="100%" stopColor={hasNegativeZone ? '#f43f5e' : '#10b981'} stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis
                  dataKey="date" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10, fontFamily: 'Barlow' }}
                  tickLine={false} axisLine={false}
                  interval={4}
                />
                <YAxis
                  tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10, fontFamily: 'Barlow' }}
                  tickLine={false} axisLine={false}
                  tickFormatter={formatMillions}
                  width={42}
                />
                <Tooltip content={<CustomTooltip />} />

                {/* Zero line */}
                <ReferenceLine y={0} stroke="rgba(244,63,94,0.4)" strokeDasharray="4 4" strokeWidth={1} />

                {/* Purchase day marker */}
                <ReferenceLine
                  x={chartData[dayOffset]?.date}
                  stroke="rgba(255,255,255,0.3)" strokeDasharray="4 4" strokeWidth={1}
                  label={{ value: '📍', position: 'top', fontSize: 14 }}
                />

                {/* Confidence band — upper fill */}
                <Area
                  type="monotone" dataKey="upperBound"
                  stroke="none" fill="url(#bandGrad)"
                  fillOpacity={1} isAnimationActive={false}
                />
                {/* Confidence band — lower (remove overlap) */}
                <Area
                  type="monotone" dataKey="lowerBound"
                  stroke="none" fill="#000"
                  fillOpacity={1} isAnimationActive={false}
                />

                {/* Expected balance line */}
                <Area
                  type="monotone" dataKey="expectedBalance"
                  stroke="#10b981" strokeWidth={2}
                  fill="url(#lineGrad)" fillOpacity={1}
                  dot={false} isAnimationActive
                  animationDuration={400}
                />
              </AreaChart>
            </ResponsiveContainer>
          </GlassCard>

          {/* Goal sensitivity alerts */}
          {result.delayedGoals.length > 0 && (
            <div
              className="flex flex-col gap-3"
              style={{
                opacity: alertVisible ? 1 : 0,
                transform: alertVisible ? 'translateY(0)' : 'translateY(12px)',
                transition: 'opacity 0.4s ease, transform 0.4s ease',
              }}
            >
              {result.delayedGoals.map(({ goal, delayDays, originalDaysRemaining, newDaysRemaining }, i) => (
                <div
                  key={goal.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '14px 18px', borderRadius: 14,
                    background: delayDays > 30 ? 'rgba(244,63,94,0.08)' : 'rgba(245,158,11,0.08)',
                    border: `1px solid ${delayDays > 30 ? 'rgba(244,63,94,0.25)' : 'rgba(245,158,11,0.25)'}`,
                    animation: `fadeSlideUp 0.35s ${i * 0.07}s both ease`,
                  }}
                >
                  <span style={{ fontSize: 22, flexShrink: 0 }}>{goal.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: '#fff', marginBottom: 2 }}>
                      ⚠️ This purchase delays your <span style={{ color: delayDays > 30 ? '#f43f5e' : '#f59e0b' }}>{goal.name}</span> by{' '}
                      <span style={{ fontWeight: 700 }}>{delayDays} days</span>
                    </div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
                      Was: {originalDaysRemaining} days → Now: {newDaysRemaining} days to target
                    </div>
                  </div>
                  <GoalArc pct={goal.currentAmount / goal.targetAmount} size={32} />
                </div>
              ))}
            </div>
          )}

          {/* All clear state */}
          {result.delayedGoals.length === 0 && amount > 0 && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '12px 18px', borderRadius: 14,
              background: 'rgba(16,185,129,0.08)',
              border: '1px solid rgba(16,185,129,0.2)',
              fontSize: 13, color: 'rgba(255,255,255,0.7)',
            }}>
              <span style={{ color: '#10b981', fontSize: 16 }}>✓</span>
              This purchase won't meaningfully delay any of your goals.
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeSlideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
