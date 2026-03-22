import { ReactNode } from 'react'
import { clsx } from 'clsx'

interface Props {
  children: ReactNode
  className?: string
  variant?: 'subtle' | 'strong'
  style?: React.CSSProperties
}

export function GlassCard({ children, className, variant = 'strong', style }: Props) {
  return (
    <div
      className={clsx(variant === 'strong' ? 'glass-strong' : 'glass-subtle', 'rounded-2xl border', className)}
      style={{ borderColor: 'rgba(255,255,255,0.08)', ...style }}
    >
      {children}
    </div>
  )
}
