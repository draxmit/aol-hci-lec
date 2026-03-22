import { useState, useEffect, useRef } from 'react'
import { GlassCard } from '../ui/GlassCard'
import { SectionBadge } from '../ui/SectionBadge'
import type { SimulatorVariable } from '../../lib/types'
import { formatRp, formatRpAbs } from '../../lib/mock-data'

declare const Chart: any

const MONTH_LABELS = ['Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar']
const BASE = 368500000
const BASELINE_DELTA = 1200000

function getProjections(vars: SimulatorVariable[]) {
  return MONTH_LABELS.map((label, m) => {
    const baseline = BASE + (m + 1) * BASELINE_DELTA
    let extra = 0
    vars.forEach((v) => {
      if (m < v.durationMonths) extra += v.type === 'income' ? v.monthlyAmount : -v.monthlyAmount
    })
    const projected = BASE + (m + 1) * (BASELINE_DELTA + extra)
    return { label, baseline, projected, delta: projected - baseline }
  })
}

let varIdCounter = 3

export function TimeMachineSimulator() {
  const [vars, setVars] = useState<SimulatorVariable[]>([
    { id: '1', label: 'Monthly Savings', monthlyAmount: 3000000, durationMonths: 12, type: 'income' },
    { id: '2', label: 'Gym Membership',  monthlyAmount: 500000,  durationMonths: 12, type: 'expense' },
  ])
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chartRef  = useRef<any>(null)

  const projections = getProjections(vars)
  const impact6  = projections[5].delta
  const impact12 = projections[11].delta

  useEffect(() => {
    if (!canvasRef.current) return
    if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null }
    const ctx = canvasRef.current.getContext('2d')!
    chartRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: MONTH_LABELS,
        datasets: [
          {
            label: 'Baseline',
            data: projections.map((p) => p.baseline),
            borderColor: 'rgba(255,255,255,0.2)',
            backgroundColor: 'rgba(255,255,255,0.03)',
            borderDash: [5, 5], borderWidth: 1.5, fill: true, tension: 0.4, pointRadius: 0,
          },
          {
            label: 'Projected',
            data: projections.map((p) => p.projected),
            borderColor: '#10b981',
            backgroundColor: 'rgba(16,185,129,0.08)',
            borderWidth: 2, fill: true, tension: 0.4, pointRadius: 3, pointBackgroundColor: '#10b981',
          },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        animation: { duration: 300 },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(0,0,0,0.9)', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1,
            titleColor: '#fff', bodyColor: 'rgba(255,255,255,0.7)',
            callbacks: { label: (c: any) => ' Rp ' + (c.raw / 1000000).toFixed(1) + 'jt' },
          },
        },
        scales: {
          x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: 'rgba(255,255,255,0.4)', font: { family: 'Barlow', size: 11 } } },
          y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: 'rgba(255,255,255,0.4)', font: { family: 'Barlow', size: 11 }, callback: (v: number) => 'Rp ' + (v / 1000000).toFixed(0) + 'jt' } },
        },
      },
    })
  }, [vars])

  const updateVar = (id: string, key: keyof SimulatorVariable, value: number | string) => {
    setVars((prev) => prev.map((v) => v.id === id ? { ...v, [key]: value } : v))
  }

  const addVar = () => {
    setVars((prev) => [...prev, { id: String(++varIdCounter), label: 'New Variable', monthlyAmount: 1000000, durationMonths: 12, type: 'expense' }])
  }

  const sliderLabelStyle: React.CSSProperties = { fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 5, display: 'flex', justifyContent: 'space-between' }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <SectionBadge>Time Machine Simulator</SectionBadge>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>12-month projection</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 20, alignItems: 'start' }}>
        {/* Left: Variables */}
        <div className="flex flex-col gap-3">
          {vars.map((v) => (
            <GlassCard key={v.id} variant="subtle" className="p-4">
              <div className="flex justify-between items-center mb-3">
                <span style={{ fontSize: 13, fontWeight: 500 }}>{v.label}</span>
                <span
                  className="inline-flex items-center rounded-full px-2.5 py-0.5"
                  style={{
                    fontSize: 10, fontWeight: 600,
                    background: v.type === 'income' ? 'rgba(16,185,129,0.15)' : 'rgba(244,63,94,0.15)',
                    color: v.type === 'income' ? '#10b981' : '#f43f5e',
                  }}
                >
                  {v.type === 'income' ? 'Income' : 'Expense'}
                </span>
              </div>

              <div style={{ marginBottom: 14 }}>
                <div style={sliderLabelStyle}>
                  <span>Amount</span>
                  <span style={{ color: '#fff' }}>{formatRpAbs(v.monthlyAmount)}/mo</span>
                </div>
                <input
                  type="range" min={0}
                  max={v.type === 'income' ? 20000000 : 10000000}
                  step={100000}
                  value={v.monthlyAmount}
                  onChange={(e) => updateVar(v.id, 'monthlyAmount', Number(e.target.value))}
                />
              </div>

              <div>
                <div style={sliderLabelStyle}>
                  <span>Duration</span>
                  <span style={{ color: '#fff' }}>{v.durationMonths} months</span>
                </div>
                <input
                  type="range" min={1} max={36} step={1}
                  value={v.durationMonths}
                  onChange={(e) => updateVar(v.id, 'durationMonths', Number(e.target.value))}
                />
              </div>
            </GlassCard>
          ))}

          <button
            onClick={addVar}
            className="glass-subtle rounded-full border w-full py-2 transition-all duration-200"
            style={{ fontSize: 12, fontWeight: 500, fontFamily: "'Barlow', sans-serif", color: 'rgba(255,255,255,0.6)', borderColor: 'rgba(255,255,255,0.15)', cursor: 'pointer' }}
          >
            + Add Variable
          </button>

          {/* Impact summary */}
          <GlassCard className="p-4">
            <div style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
              Impact Summary
            </div>
            {[
              { label: 'Month 6',  val: impact6 },
              { label: 'Month 12', val: impact12 },
            ].map(({ label, val }) => (
              <div key={label} className="flex justify-between items-center mb-2" style={{ fontSize: 13 }}>
                <span style={{ color: 'rgba(255,255,255,0.5)' }}>{label}</span>
                <span style={{ fontWeight: 600, color: val >= 0 ? '#10b981' : '#f43f5e' }}>
                  {formatRp(val)}
                </span>
              </div>
            ))}
          </GlassCard>
        </div>

        {/* Right: Chart */}
        <GlassCard className="p-5">
          <div style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>
            Balance Projection
          </div>
          <div className="flex gap-5 mb-4">
            {[
              { label: 'Baseline', color: 'rgba(255,255,255,0.3)', dash: true },
              { label: 'Projected', color: '#10b981', dash: false },
            ].map(({ label, color, dash }) => (
              <div key={label} className="flex items-center gap-2" style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
                <span style={{ width: 20, height: 2, background: color, display: 'inline-block', borderTop: dash ? '2px dashed' : '2px solid', borderColor: color }} />
                {label}
              </div>
            ))}
          </div>
          <div style={{ position: 'relative', width: '100%', height: 320 }}>
            <canvas ref={canvasRef} />
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
