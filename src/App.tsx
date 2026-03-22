import { useState, useEffect } from 'react'
import { EntryPage } from './pages/EntryPage'
import { DashboardPage } from './pages/DashboardPage'
import { TransactionsPage } from './pages/TransactionsPage'
import { InsightsPage } from './pages/InsightsPage'
import { SimulatorPage } from './pages/SimulatorPage'
import { AppShell } from './components/layout/AppShell'
import { OmniTransactionInput } from './components/transactions/OmniTransactionInput'
import type { Page } from './lib/types'
import './styles/globals.css'

export default function App() {
  const [entered, setEntered] = useState(false)
  const [fading, setFading]   = useState(false)
  const [page, setPage]       = useState<Page>('dashboard')
  const [omniOpen, setOmniOpen] = useState(false)

  // ⌘K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); if (entered) setOmniOpen(true) }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [entered])

  const handleEnter = () => {
    setFading(true)
    setTimeout(() => setEntered(true), 700)
  }

  if (!entered) {
    return (
      <div style={{ opacity: fading ? 0 : 1, transition: 'opacity 0.7s ease' }}>
        <EntryPage onEnter={handleEnter} />
      </div>
    )
  }

  return (
    <>
      <AppShell activePage={page} onNavigate={setPage} onOpenOmni={() => setOmniOpen(true)}>
        {page === 'dashboard'     && <DashboardPage />}
        {page === 'transactions'  && <TransactionsPage onOpenOmni={() => setOmniOpen(true)} />}
        {page === 'insights'      && <InsightsPage />}
        {page === 'simulator'     && <SimulatorPage />}
      </AppShell>

      <OmniTransactionInput
        isOpen={omniOpen}
        onClose={() => setOmniOpen(false)}
        onSave={(raw) => { console.log('Saved:', raw) }}
      />
    </>
  )
}
