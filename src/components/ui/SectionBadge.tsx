import { ReactNode } from 'react'
import { clsx } from 'clsx'

interface Props {
  children: ReactNode
  className?: string
  color?: 'default' | 'amber' | 'rose' | 'emerald'
}

export function SectionBadge({ children, className, color = 'default' }: Props) {
  const colorStyles: Record<string, React.CSSProperties> = {
    default: {},
    amber:   { background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', color: '#f59e0b' },
    rose:    { background: 'rgba(244,63,94,0.1)',  border: '1px solid rgba(244,63,94,0.2)',  color: '#f43f5e' },
    emerald: { background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#10b981' },
  }
  return (
    <span
      className={clsx('glass-subtle inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-medium text-white', className)}
      style={colorStyles[color]}
    >
      {children}
    </span>
  )
}
