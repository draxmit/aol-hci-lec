import type { Transaction, AssetPortfolio, BehavioralInsight } from './types'

export const PORTFOLIO: AssetPortfolio = {
  totalNetWorth: 368500000,
  liquidRatio: 0.48,
  assets: [
    { id: 'bca', name: 'BCA Savings', type: 'fiat', liquidityLevel: 'liquid', balance: 156200000, currency: 'IDR', icon: '🏦' },
    { id: 'btc', name: 'Bitcoin (Binance)', type: 'crypto', liquidityLevel: 'semi-liquid', balance: 98700000, currency: 'BTC', icon: '₿' },
    { id: 'rdana', name: 'Reksa Dana', type: 'investment', liquidityLevel: 'semi-liquid', balance: 72100000, currency: 'IDR', icon: '📈' },
    { id: 'gold', name: 'Gold Bar (Antam)', type: 'physical', liquidityLevel: 'illiquid', balance: 41500000, currency: 'IDR', icon: '🥇' },
  ],
  breakdown: { fiat: 156200000, crypto: 98700000, physical: 41500000, investment: 72100000 },
}

export const TRANSACTIONS: Transaction[] = [
  { id: '1', amount: 78000, type: 'expense', category: 'F&B', description: 'Starbucks SCBD', date: 'Mar 21', dayOfWeek: 5, timeOfDay: 14, assetSourceId: 'gopay', isInferred: true, needsReview: true, inferenceConfidence: 0.91 },
  { id: '2', amount: 45000, type: 'expense', category: 'Transport', description: 'Grab Car - Sudirman', date: 'Mar 21', dayOfWeek: 5, timeOfDay: 9, assetSourceId: 'ovo', isInferred: true, needsReview: false, inferenceConfidence: 0.88 },
  { id: '3', amount: 15000000, type: 'income', category: 'Income', description: 'Salary - PT Maju', date: 'Mar 20', dayOfWeek: 4, timeOfDay: 8, assetSourceId: 'bca', isInferred: false, needsReview: false },
  { id: '4', amount: 186000, type: 'expense', category: 'Entertainment', description: 'Netflix Subscription', date: 'Mar 19', dayOfWeek: 3, timeOfDay: 12, assetSourceId: 'bni', isInferred: false, needsReview: false },
  { id: '5', amount: 25000, type: 'expense', category: 'F&B', description: 'Warteg Bahari', date: 'Mar 18', dayOfWeek: 2, timeOfDay: 13, assetSourceId: 'cash', isInferred: true, needsReview: true, inferenceConfidence: 0.79 },
  { id: '6', amount: 340000, type: 'expense', category: 'Shopping', description: 'Shopee - Earbuds', date: 'Mar 17', dayOfWeek: 1, timeOfDay: 20, assetSourceId: 'shopeepay', isInferred: false, needsReview: false },
  { id: '7', amount: 200000, type: 'expense', category: 'Transport', description: 'Pertamina - Bensin', date: 'Mar 16', dayOfWeek: 0, timeOfDay: 10, assetSourceId: 'bca', isInferred: false, needsReview: false },
  { id: '8', amount: 95000, type: 'expense', category: 'Health', description: 'Halodoc Konsultasi', date: 'Mar 15', dayOfWeek: 6, timeOfDay: 11, assetSourceId: 'gopay', isInferred: true, needsReview: false, inferenceConfidence: 0.85 },
  { id: '9', amount: 500000, type: 'expense', category: 'Bills & Utilities', description: 'PLN Listrik', date: 'Mar 14', dayOfWeek: 5, timeOfDay: 9, assetSourceId: 'bca', isInferred: false, needsReview: false },
  { id: '10', amount: 1200000, type: 'expense', category: 'Entertainment', description: 'Konser Ari Lasso', date: 'Mar 14', dayOfWeek: 5, timeOfDay: 19, assetSourceId: 'gopay', isInferred: false, needsReview: false },
]

export const INSIGHTS: BehavioralInsight[] = [
  { id: 'i1', title: 'Friday Night Overspend Risk', description: 'You spend 2.3× more on F&B on Fridays vs other days. Over the last 12 weeks this pattern has been consistent, with an average overspend of Rp 156k per Friday.', probability: 0.87, severity: 'critical', affectedCategory: 'F&B', historicalAverage: 156000, confidenceInterval: [0.79, 0.91], isDismissed: false },
  { id: 'i2', title: 'Weekend Entertainment Spike', description: 'Entertainment spending on weekends averages Rp 340k vs Rp 95k on weekdays — a 258% increase. Primarily driven by streaming services and dining out.', probability: 0.72, severity: 'warning', affectedCategory: 'Entertainment', historicalAverage: 340000, confidenceInterval: [0.64, 0.78], isDismissed: false },
  { id: 'i3', title: 'Monthly Subscription Creep', description: 'Subscription services have grown 41% over the last 6 months. You currently have 8 active subscriptions totaling Rp 1.2jt per month.', probability: 0.61, severity: 'warning', affectedCategory: 'Bills & Utilities', historicalAverage: 1200000, confidenceInterval: [0.55, 0.68], isDismissed: false },
]

export const MONTHLY_SPENDING = {
  labels: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
  spending: [4200000, 5100000, 7800000, 3900000, 4600000, 5300000],
  income:   [15000000, 15000000, 18000000, 15000000, 15000000, 15000000],
}

export const CATEGORY_SPENDING = {
  labels: ['F&B', 'Transport', 'Entertainment', 'Shopping', 'Health', 'Bills'],
  data:   [2100000, 800000, 1200000, 950000, 700000, 500000],
}

export function formatRp(n: number): string {
  const abs = Math.abs(n)
  const sign = n < 0 ? '-' : '+'
  if (abs >= 1000000) return sign + 'Rp ' + (abs / 1000000).toFixed(1) + 'jt'
  return sign + 'Rp ' + Math.round(abs / 1000) + 'k'
}

export function formatRpAbs(n: number): string {
  if (n >= 1000000) return 'Rp ' + (n / 1000000).toFixed(1) + 'jt'
  return 'Rp ' + Math.round(n / 1000) + 'k'
}
