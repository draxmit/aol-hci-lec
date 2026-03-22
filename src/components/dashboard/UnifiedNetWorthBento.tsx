import { useEffect, useRef } from 'react'
import { GlassCard } from '../ui/GlassCard'
import { SectionBadge } from '../ui/SectionBadge'
import type { AssetPortfolio, Transaction } from '../../lib/types'
import { formatRp, formatRpAbs } from '../../lib/mock-data'

function useCountUp(target: number, duration = 1400) {
  const elRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = elRef.current
    if (!el) return
    let start: number | null = null
    const fmt = (n: number) => 'Rp ' + (n / 1000000).toFixed(0) + 'jt'
    function step(ts: number) {
      if (!start) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      const ease = 1 - Math.pow(1 - progress, 3)
      el!.textContent = fmt(ease * target)
      if (progress < 1) requestAnimationFrame(step)
      else el!.textContent = fmt(target)
    }
    requestAnimationFrame(step)
  }, [target, duration])
  return elRef
}

interface Props {
  portfolio: AssetPortfolio
  recentTransactions: Transaction[]
}

export function UnifiedNetWorthBento({ portfolio, recentTransactions }: Props) {
  const counterRef = useCountUp(portfolio.totalNetWorth)

  const liquid = Math.round(portfolio.liquidRatio * 100)
  const semi   = 31
  const illiq  = 100 - liquid - semi

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <SectionBadge>Net Worth</SectionBadge>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>Updated just now</span>
        </div>
        <button
          className="glass-subtle rounded-full border px-4 py-1.5 transition-all duration-200"
          style={{ fontSize: 12, fontWeight: 500, fontFamily: "'Barlow', sans-serif", color: 'rgba(255,255,255,0.7)', borderColor: 'rgba(255,255,255,0.2)', cursor: 'pointer' }}
        >
          + Add Asset
        </button>
      </div>

      {/* Bento Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>

        {/* HERO */}
        <GlassCard className="reveal p-5" style={{ gridColumn: 'span 2' }}>
          <div style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
            Total Net Worth
          </div>
          <div
            ref={counterRef}
            style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontSize: 44, letterSpacing: -3, lineHeight: 1 }}
          >
            Rp 0
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 6 }}>
            Across {portfolio.assets.length} assets ·{' '}
            <span style={{ color: '#10b981' }}>▲ 8.3% this month</span>
          </div>
          <div style={{ marginTop: 20, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {[
              { label: 'Liquid', pct: liquid, color: '#10b981' },
              { label: 'Semi',   pct: semi,   color: '#f59e0b' },
              { label: 'Illiquid', pct: illiq, color: '#f43f5e' },
            ].map(({ label, pct, color }) => (
              <div key={label} className="flex items-center gap-1.5" style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block' }} />
                {label} {pct}%
              </div>
            ))}
          </div>
        </GlassCard>

        {/* LIQUIDITY */}
        <GlassCard className="reveal p-5" style={{ transitionDelay: '0.1s' }}>
          <div style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
            Liquidity Ratio
          </div>
          <div style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontSize: 32, letterSpacing: -2 }}>
            {liquid}%
          </div>
          <div style={{ height: 6, borderRadius: 3, overflow: 'hidden', display: 'flex', gap: 2, margin: '10px 0' }}>
            <div style={{ height: '100%', borderRadius: 3, background: '#10b981', width: `${liquid}%`, transition: 'width 0.8s ease' }} />
            <div style={{ height: '100%', borderRadius: 3, background: '#f59e0b', width: `${semi}%`,  transition: 'width 0.8s ease' }} />
            <div style={{ height: '100%', borderRadius: 3, background: '#f43f5e', width: `${illiq}%`, transition: 'width 0.8s ease' }} />
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Available instantly</div>
        </GlassCard>

        {/* BEST PERFORMER */}
        <GlassCard className="reveal p-5" style={{ transitionDelay: '0.15s' }}>
          <div style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
            Best Performer
          </div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <span style={{ fontSize: 24 }}>₿</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>Bitcoin</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Crypto · Binance</div>
            </div>
          </div>
          <div style={{ color: '#10b981', fontSize: 20, fontWeight: 600, marginTop: 4 }}>+22.4%</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Last 30 days</div>
        </GlassCard>

        {/* BREAKDOWN */}
        <GlassCard className="reveal p-5" style={{ transitionDelay: '0.2s' }}>
          <div style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
            Asset Breakdown
          </div>
          <div className="flex flex-col gap-1.5">
            {[
              { icon: '🏦', label: 'Fiat',       val: portfolio.breakdown.fiat },
              { icon: '₿',  label: 'Crypto',     val: portfolio.breakdown.crypto },
              { icon: '📈', label: 'Investment', val: portfolio.breakdown.investment },
              { icon: '🥇', label: 'Physical',   val: portfolio.breakdown.physical },
            ].map(({ icon, label, val }) => (
              <div key={label} className="flex justify-between items-center" style={{ fontSize: 12 }}>
                <span style={{ color: 'rgba(255,255,255,0.5)' }}>{icon} {label}</span>
                <span style={{ fontWeight: 500 }}>{formatRpAbs(val)}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* RECENT TRANSACTIONS */}
        <GlassCard className="reveal p-5" style={{ transitionDelay: '0.25s' }}>
          <div style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
            Recent
          </div>
          <div className="flex flex-col gap-2.5">
            {recentTransactions.slice(0, 3).map((tx) => (
              <div key={tx.id} className="flex justify-between items-center" style={{ fontSize: 12 }}>
                <div>
                  <div style={{ fontWeight: 500 }}>{tx.description}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{tx.category} · {tx.date}</div>
                </div>
                <span style={{ color: tx.type === 'income' ? '#10b981' : '#f43f5e' }}>
                  {formatRp(tx.type === 'income' ? tx.amount : -tx.amount)}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>

      </div>
    </div>
  )
}
