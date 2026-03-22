export function formatRp(amount: number, sign = true): string {
  const abs = Math.abs(amount)
  const prefix = sign ? (amount < 0 ? '-' : '+') : ''
  if (abs >= 1_000_000) return `${prefix}Rp ${(abs / 1_000_000).toFixed(1)}jt`
  if (abs >= 1_000) return `${prefix}Rp ${Math.round(abs / 1_000)}k`
  return `${prefix}Rp ${abs}`
}

export function formatRpFull(amount: number): string {
  return 'Rp ' + Math.floor(amount / 1_000_000).toLocaleString('id-ID') + 'jt'
}

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ')
}
