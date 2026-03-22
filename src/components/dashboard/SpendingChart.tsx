import { useState, useEffect, useRef } from 'react'
import { GlassCard } from '../ui/GlassCard'
import { SectionBadge } from '../ui/SectionBadge'
import { MONTHLY_SPENDING, CATEGORY_SPENDING } from '../../lib/mock-data'

type View = 'monthly' | 'category'

declare const Chart: any

export function SpendingChart() {
  const [view, setView] = useState<View>('monthly')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chartRef  = useRef<any>(null)

  useEffect(() => {
    if (!canvasRef.current) return
    if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null }

    const ctx = canvasRef.current.getContext('2d')!
    if (view === 'monthly') {
      chartRef.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: MONTHLY_SPENDING.labels,
          datasets: [
            {
              label: 'Spending',
              data: MONTHLY_SPENDING.spending,
              backgroundColor: 'rgba(255,255,255,0.08)',
              borderColor: 'rgba(255,255,255,0.2)',
              borderWidth: 1,
              borderRadius: 6,
              hoverBackgroundColor: 'rgba(255,255,255,0.14)',
            },
            {
              label: 'Income',
              data: MONTHLY_SPENDING.income,
              backgroundColor: 'rgba(16,185,129,0.15)',
              borderColor: 'rgba(16,185,129,0.4)',
              borderWidth: 1,
              borderRadius: 6,
              hoverBackgroundColor: 'rgba(16,185,129,0.25)',
            },
          ],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: 'rgba(0,0,0,0.9)',
              borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1,
              titleColor: '#fff', bodyColor: 'rgba(255,255,255,0.7)',
              callbacks: { label: (c: any) => ' Rp ' + Math.round(c.raw / 1000) + 'k' },
            },
          },
          scales: {
            x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: 'rgba(255,255,255,0.4)', font: { family: 'Barlow', size: 11 } } },
            y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: 'rgba(255,255,255,0.4)', font: { family: 'Barlow', size: 11 }, callback: (v: number) => 'Rp ' + (v / 1000000).toFixed(0) + 'jt' } },
          },
        },
      })
    } else {
      chartRef.current = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: CATEGORY_SPENDING.labels,
          datasets: [{
            data: CATEGORY_SPENDING.data,
            backgroundColor: ['rgba(244,63,94,0.7)','rgba(245,158,11,0.7)','rgba(16,185,129,0.7)','rgba(59,130,246,0.7)','rgba(139,92,246,0.7)','rgba(255,255,255,0.2)'],
            borderWidth: 0, hoverOffset: 6,
          }],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: 'rgba(0,0,0,0.9)',
              borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1,
              titleColor: '#fff', bodyColor: 'rgba(255,255,255,0.7)',
              callbacks: { label: (c: any) => ' Rp ' + Math.round(c.raw / 1000) + 'k' },
            },
          },
        },
      })
    }
    return () => { chartRef.current?.destroy(); chartRef.current = null }
  }, [view])

  const CAT_COLORS = ['#f43f5e','#f59e0b','#10b981','#3b82f6','#8b5cf6','rgba(255,255,255,0.4)']

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-4">
        <SectionBadge>Monthly Spending</SectionBadge>
        <div
          className="flex gap-1 rounded-xl border p-1"
          style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' }}
        >
          {(['monthly', 'category'] as View[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className="rounded-lg px-4 py-1.5 transition-all duration-200"
              style={{
                fontSize: 12, fontWeight: 500, fontFamily: "'Barlow', sans-serif", cursor: 'pointer', border: 'none',
                background: view === v ? 'rgba(255,255,255,0.1)' : 'transparent',
                color: view === v ? '#fff' : 'rgba(255,255,255,0.4)',
              }}
            >
              {v === 'monthly' ? 'Monthly' : 'By Category'}
            </button>
          ))}
        </div>
      </div>

      {view === 'category' && (
        <div className="flex flex-wrap gap-4 mb-3">
          {CATEGORY_SPENDING.labels.map((label, i) => (
            <div key={label} className="flex items-center gap-1.5" style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: CAT_COLORS[i], display: 'inline-block' }} />
              {label}
            </div>
          ))}
        </div>
      )}

      <div style={{ position: 'relative', width: '100%', height: 220 }}>
        <canvas ref={canvasRef} />
      </div>
    </GlassCard>
  )
}
