import type { TransactionCategory } from './types'

const CATEGORY_KEYWORDS: Record<TransactionCategory, string[]> = {
  'F&B':             ['makan', 'minum', 'kopi', 'starbucks', 'resto', 'warteg', 'grab food', 'gofood', 'lunch', 'dinner', 'sushi', 'pizza', 'bakso', 'nasi', 'cafe', 'coffee'],
  'Transport':       ['grab', 'gojek', 'ojek', 'bensin', 'parkir', 'tol', 'transjakarta', 'taxi', 'uber'],
  'Entertainment':   ['bioskop', 'netflix', 'spotify', 'game', 'nonton', 'cinema', 'concert', 'konser'],
  'Shopping':        ['shopee', 'tokopedia', 'lazada', 'beli', 'mall', 'toko', 'alfamart', 'indomaret'],
  'Health':          ['halodoc', 'dokter', 'apotik', 'obat', 'klinik', 'rs', 'rumah sakit'],
  'Bills & Utilities': ['listrik', 'pln', 'pdam', 'internet', 'telkom', 'subscription', 'langganan'],
  'Investment':      ['saham', 'reksa dana', 'crypto', 'bitcoin', 'eth', 'investasi'],
  'Income':          ['gaji', 'salary', 'bonus', 'transfer masuk', 'terima'],
  'Transfer':        ['transfer', 'kirim'],
  'Other':           [],
}

const SOURCE_KEYWORDS: Record<string, string[]> = {
  'GoPay':      ['gopay', 'gojek'],
  'OVO':        ['ovo'],
  'ShopeePay':  ['shopee', 'shopeepay'],
  'Dana':       ['dana'],
  'BCA':        ['bca'],
  'BNI':        ['bni'],
  'Mandiri':    ['mandiri'],
  'Cash':       ['cash', 'tunai'],
  'e-wallet':   ['e-wallet', 'ewallet', 'dompet digital'],
}

export interface ParsedTransaction {
  description: string
  amount: number | null
  category: TransactionCategory
  assetSource: string
  confidence: number
}

export function parseNaturalInput(raw: string): ParsedTransaction {
  const lower = raw.toLowerCase()

  // Amount
  let amount: number | null = null
  const match = lower.match(/(\d+(?:[.,]\d+)?)\s*(rb|ribu|k|jt|juta|m)/i)
  if (match) {
    const n = parseFloat(match[1].replace(',', '.'))
    amount = ['rb','ribu','k'].includes(match[2].toLowerCase()) ? n * 1000 : n * 1000000
  }

  // Category
  let category: TransactionCategory = 'Other'
  for (const [cat, kws] of Object.entries(CATEGORY_KEYWORDS)) {
    if (kws.some(k => lower.includes(k))) { category = cat as TransactionCategory; break }
  }

  // Source
  let assetSource = 'Unknown'
  for (const [src, kws] of Object.entries(SOURCE_KEYWORDS)) {
    if (kws.some(k => lower.includes(k))) { assetSource = src; break }
  }

  // Description: strip amount tokens
  const description = raw.replace(/\d+(?:[.,]\d+)?\s*(?:rb|ribu|k|jt|juta)/gi, '').replace(/\s+/g, ' ').trim()

  const confidence = amount ? (category !== 'Other' ? 0.91 : 0.72) : 0.45

  return { description: description || raw, amount, category, assetSource, confidence }
}
