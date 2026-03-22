import { useEffect, useRef } from 'react'
import { EntryShader } from '../components/animations/EntryShader'

interface Props { onEnter: () => void }

export function EntryPage({ onEnter }: Props) {
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Enter') onEnter() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onEnter])

  return (
    <div className="fixed inset-0 flex items-center justify-center" style={{ zIndex: 100 }}>
      <EntryShader />

      {/* Centered glass card */}
      <div
        ref={cardRef}
        className="glass-strong relative rounded-3xl flex flex-col items-center gap-5 text-center"
        style={{
          padding: '56px 72px',
          border: '1px solid rgba(255,255,255,0.1)',
          zIndex: 10,
          animation: 'entryFadeUp 0.9s 0.8s both ease',
        }}
      >
        <div
          className="glass-subtle inline-flex items-center gap-2 rounded-full px-3.5 py-1"
          style={{ fontSize: 11, fontWeight: 500, marginBottom: 4 }}
        >
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
          Financial Intelligence Platform
        </div>

        <h1 style={{ fontSize: 72, letterSpacing: -4, lineHeight: 1, margin: 0 }}>
          Beyond<br />Banking
        </h1>

        <p style={{ fontSize: 15, fontWeight: 300, color: 'rgba(255,255,255,0.55)', letterSpacing: 0, margin: 0 }}>
          The analytical financial tool<br />your bank is too afraid to build.
        </p>

        <div className="flex gap-3 mt-2">
          <button
            onClick={onEnter}
            className="rounded-full border-none transition-all duration-200"
            style={{
              background: '#fff', color: '#000',
              padding: '14px 44px', fontSize: 14, fontWeight: 600,
              fontFamily: "'Barlow', sans-serif", cursor: 'pointer',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.03)' }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)' }}
          >
            Enter
          </button>
          <button
            className="glass-subtle rounded-full border transition-all duration-200"
            style={{
              padding: '14px 28px', fontSize: 14, fontWeight: 500,
              fontFamily: "'Barlow', sans-serif", color: 'rgba(255,255,255,0.65)',
              borderColor: 'rgba(255,255,255,0.18)', cursor: 'pointer', background: 'transparent',
            }}
          >
            Learn More
          </button>
        </div>
      </div>

      <style>{`
        @keyframes entryFadeUp {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
