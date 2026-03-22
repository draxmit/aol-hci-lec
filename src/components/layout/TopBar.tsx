import type { Page } from '../../lib/types'

const PAGE_TITLES: Record<Page, string> = {
  dashboard: 'Dashboard',
  transactions: 'Transactions',
  insights: 'Behavioral Insights',
  simulator: 'Time Machine',
}

interface Props {
  activePage: Page
  onOpenOmni: () => void
}

export function TopBar({ activePage, onOpenOmni }: Props) {
  return (
    <div
      className="glass-subtle flex items-center gap-4 border-b px-6"
      style={{ height: 56, borderColor: 'rgba(255,255,255,0.08)', flexShrink: 0, zIndex: 10 }}
    >
      <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontSize: 20, letterSpacing: -1, flex: 1 }}>
        {PAGE_TITLES[activePage]}
      </span>

      <button
        onClick={onOpenOmni}
        className="flex items-center gap-2 rounded-full border transition-all duration-200"
        style={{
          width: 280, padding: '8px 16px',
          background: 'rgba(255,255,255,0.04)',
          borderColor: 'rgba(255,255,255,0.1)',
          color: 'rgba(255,255,255,0.4)',
          fontSize: 13, fontFamily: "'Barlow', sans-serif", cursor: 'pointer',
        }}
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="7" cy="7" r="5"/><path d="m11 11 3 3"/>
        </svg>
        <span style={{ flex: 1, textAlign: 'left' }}>Add transaction...</span>
        <kbd style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 4, padding: '1px 6px', fontSize: 11 }}>⌘K</kbd>
      </button>

      <div
        className="glass-subtle inline-flex items-center gap-1.5 rounded-full px-3 py-1"
        style={{ fontSize: 11, fontWeight: 500 }}
      >
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
        Live
      </div>
    </div>
  )
}
