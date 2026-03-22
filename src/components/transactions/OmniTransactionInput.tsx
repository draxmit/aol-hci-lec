import { useState, useEffect, useRef } from 'react'
import { parseNaturalInput } from '../../lib/nlp-parser'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSave: (raw: string) => void
}

export function OmniTransactionInput({ isOpen, onClose, onSave }: Props) {
  const [raw, setRaw] = useState('')
  const [parsed, setParsed] = useState<ReturnType<typeof parseNaturalInput> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setRaw(''); setParsed(null)
      setTimeout(() => inputRef.current?.focus(), 80)
    }
  }, [isOpen])

  useEffect(() => {
    if (raw.length >= 4) setParsed(parseNaturalInput(raw))
    else setParsed(null)
  }, [raw])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 flex items-start justify-center"
      style={{ zIndex: 200, paddingTop: 100, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="glass-strong rounded-2xl border overflow-hidden"
        style={{ width: 560, borderColor: 'rgba(255,255,255,0.12)' }}
      >
        {/* Input row */}
        <div className="flex items-center gap-3 border-b px-5 py-4" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5">
            <path d="M2 8h12M8 2v12"/>
          </svg>
          <input
            ref={inputRef}
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            placeholder="e.g. Makan siang warteg 25rb cash"
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              color: '#fff', fontFamily: "'Barlow', sans-serif", fontSize: 15, fontWeight: 300,
            }}
          />
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', whiteSpace: 'nowrap' }}>ESC to close</span>
        </div>

        {/* Preview */}
        {parsed && (
          <div style={{ padding: '16px 20px' }}>
            <div style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
              AI Inference Preview
            </div>
            {[
              { key: 'Amount',     val: parsed.amount ? 'Rp ' + Math.round(parsed.amount / 1000) + 'k' : '—' },
              { key: 'Category',   val: parsed.category },
              { key: 'Source',     val: parsed.assetSource },
              { key: 'Description', val: parsed.description },
              { key: 'Confidence', val: Math.round(parsed.confidence * 100) + '%', color: '#10b981' },
            ].map(({ key, val, color }) => (
              <div
                key={key}
                className="flex justify-between items-center py-2 border-b"
                style={{ fontSize: 13, borderColor: 'rgba(255,255,255,0.05)' }}
              >
                <span style={{ color: 'rgba(255,255,255,0.4)' }}>{key}</span>
                <span style={{ fontWeight: 500, color: color || '#fff' }}>{val}</span>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        {parsed && (
          <div className="flex justify-end gap-2 px-5 py-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
            <button
              onClick={onClose}
              className="glass-subtle rounded-full border px-4 py-1.5"
              style={{ fontSize: 12, fontFamily: "'Barlow', sans-serif", color: 'rgba(255,255,255,0.7)', borderColor: 'rgba(255,255,255,0.15)', cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              onClick={() => { onSave(raw); onClose() }}
              className="rounded-full border-none px-5 py-1.5"
              style={{ fontSize: 12, fontWeight: 600, fontFamily: "'Barlow', sans-serif", background: '#fff', color: '#000', cursor: 'pointer' }}
            >
              Confirm & Save
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
