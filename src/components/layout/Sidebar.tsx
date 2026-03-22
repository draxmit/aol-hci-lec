import type { Page } from '../../lib/types'

interface NavItem { id: Page; label: string; icon: JSX.Element }

const NAV: NavItem[] = [
  {
    id: 'dashboard', label: 'Dashboard',
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="1" width="6" height="6" rx="1.5"/><rect x="9" y="1" width="6" height="6" rx="1.5"/><rect x="1" y="9" width="6" height="6" rx="1.5"/><rect x="9" y="9" width="6" height="6" rx="1.5"/></svg>,
  },
  {
    id: 'transactions', label: 'Transactions',
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 5h12M2 8h8M2 11h5"/></svg>,
  },
  {
    id: 'insights', label: 'Insights',
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 2v3M12.5 3.5l-2.1 2.1M14 8h-3M12.5 12.5l-2.1-2.1M8 14v-3M3.5 12.5l2.1-2.1M2 8h3M3.5 3.5l2.1 2.1"/></svg>,
  },
  {
    id: 'simulator', label: 'Simulator',
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 13l3-5 3 3 4-7"/></svg>,
  },
]

interface Props {
  activePage: Page
  onNavigate: (page: Page) => void
}

export function Sidebar({ activePage, onNavigate }: Props) {
  return (
    <nav
      className="glass-subtle relative flex flex-col gap-1 border-r py-7 px-4"
      style={{ width: 220, minHeight: '100vh', borderColor: 'rgba(255,255,255,0.08)', zIndex: 10, flexShrink: 0 }}
    >
      <div style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontSize: 22, letterSpacing: -2, color: '#fff', marginBottom: 24, padding: '0 8px', lineHeight: 1.1 }}>
        Beyond<br/>Banking
      </div>

      {NAV.map((item) => (
        <button
          key={item.id}
          onClick={() => onNavigate(item.id)}
          className="flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-all duration-200"
          style={{
            fontSize: 13, fontWeight: 500, fontFamily: "'Barlow', sans-serif", cursor: 'pointer',
            background: activePage === item.id ? 'rgba(255,255,255,0.06)' : 'transparent',
            color: activePage === item.id ? '#fff' : 'rgba(255,255,255,0.45)',
            borderColor: activePage === item.id ? 'rgba(255,255,255,0.1)' : 'transparent',
          }}
        >
          <span style={{ opacity: activePage === item.id ? 1 : 0.6 }}>{item.icon}</span>
          {item.label}
        </button>
      ))}

      <div className="mt-auto border-t pt-4" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <button
          className="flex items-center gap-2.5 w-full rounded-xl border border-transparent px-3 py-2.5 transition-all duration-200"
          style={{ fontSize: 13, fontWeight: 500, fontFamily: "'Barlow', sans-serif", color: 'rgba(255,255,255,0.45)', cursor: 'pointer' }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ opacity: 0.6 }}><circle cx="8" cy="6" r="3"/><path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6"/></svg>
          Profile
        </button>
      </div>
    </nav>
  )
}
