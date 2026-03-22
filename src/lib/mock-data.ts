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

// ─── Goals (for What-If simulator) ───────────────────────────────────────────
import type { FinancialGoal } from './types'

export const GOALS: FinancialGoal[] = [
  { id: 'g1', name: 'Emergency Fund',    targetAmount: 50_000_000,  currentAmount: 23_400_000, targetDate: '2025-09-01', icon: '🛡️' },
  { id: 'g2', name: 'Bali Trip',         targetAmount: 12_000_000,  currentAmount: 7_200_000,  targetDate: '2025-07-15', icon: '🏝️' },
  { id: 'g3', name: 'Laptop Upgrade',    targetAmount: 22_000_000,  currentAmount: 14_500_000, targetDate: '2025-08-01', icon: '💻' },
  { id: 'g4', name: 'Down Payment Fund', targetAmount: 200_000_000, currentAmount: 41_000_000, targetDate: '2027-01-01', icon: '🏠' },
]

// Rich 60-transaction history (6 weeks) for strong engine signal
export const RICH_TRANSACTIONS: Transaction[] = [
  { id: 'r1',  amount: 78000,    type: 'expense', category: 'F&B',              description: 'Starbucks SCBD',         date: 'Mar 21', dayOfWeek: 5, timeOfDay: 14, assetSourceId: 'gopay',     isInferred: true,  needsReview: true,  inferenceConfidence: 0.91 },
  { id: 'r2',  amount: 45000,    type: 'expense', category: 'Transport',        description: 'Grab Car - Sudirman',    date: 'Mar 21', dayOfWeek: 5, timeOfDay: 9,  assetSourceId: 'ovo',       isInferred: true,  needsReview: false, inferenceConfidence: 0.88 },
  { id: 'r3',  amount: 15000000, type: 'income',  category: 'Income',           description: 'Salary - PT Maju',       date: 'Mar 20', dayOfWeek: 4, timeOfDay: 8,  assetSourceId: 'bca',       isInferred: false, needsReview: false },
  { id: 'r4',  amount: 186000,   type: 'expense', category: 'Entertainment',    description: 'Netflix Subscription',   date: 'Mar 19', dayOfWeek: 3, timeOfDay: 12, assetSourceId: 'bni',       isInferred: false, needsReview: false },
  { id: 'r5',  amount: 25000,    type: 'expense', category: 'F&B',              description: 'Warteg Bahari',          date: 'Mar 18', dayOfWeek: 2, timeOfDay: 13, assetSourceId: 'cash',      isInferred: true,  needsReview: true,  inferenceConfidence: 0.79 },
  { id: 'r6',  amount: 340000,   type: 'expense', category: 'Shopping',         description: 'Shopee - Earbuds',       date: 'Mar 17', dayOfWeek: 1, timeOfDay: 20, assetSourceId: 'shopeepay', isInferred: false, needsReview: false },
  { id: 'r7',  amount: 200000,   type: 'expense', category: 'Transport',        description: 'Pertamina - Bensin',     date: 'Mar 16', dayOfWeek: 0, timeOfDay: 10, assetSourceId: 'bca',       isInferred: false, needsReview: false },
  { id: 'r8',  amount: 95000,    type: 'expense', category: 'Health',           description: 'Halodoc Konsultasi',     date: 'Mar 15', dayOfWeek: 6, timeOfDay: 11, assetSourceId: 'gopay',     isInferred: true,  needsReview: false, inferenceConfidence: 0.85 },
  { id: 'r9',  amount: 500000,   type: 'expense', category: 'Bills & Utilities',description: 'PLN Listrik',            date: 'Mar 14', dayOfWeek: 5, timeOfDay: 9,  assetSourceId: 'bca',       isInferred: false, needsReview: false },
  { id: 'r10', amount: 1200000,  type: 'expense', category: 'Entertainment',    description: 'Konser Ari Lasso',       date: 'Mar 14', dayOfWeek: 5, timeOfDay: 19, assetSourceId: 'gopay',     isInferred: false, needsReview: false },
  { id: 'r11', amount: 65000,    type: 'expense', category: 'F&B',              description: 'Kopi Kenangan',          date: 'Mar 13', dayOfWeek: 4, timeOfDay: 8,  assetSourceId: 'gopay',     isInferred: true,  needsReview: false, inferenceConfidence: 0.93 },
  { id: 'r12', amount: 320000,   type: 'expense', category: 'Shopping',         description: 'Uniqlo - T-shirt',       date: 'Mar 13', dayOfWeek: 4, timeOfDay: 18, assetSourceId: 'bca',       isInferred: false, needsReview: false },
  { id: 'r13', amount: 55000,    type: 'expense', category: 'Transport',        description: 'GoCar Menteng',          date: 'Mar 12', dayOfWeek: 3, timeOfDay: 8,  assetSourceId: 'gopay',     isInferred: true,  needsReview: false },
  { id: 'r14', amount: 85000,    type: 'expense', category: 'F&B',              description: 'Sushi Tei',             date: 'Mar 12', dayOfWeek: 3, timeOfDay: 13, assetSourceId: 'bca',       isInferred: false, needsReview: false },
  { id: 'r15', amount: 250000,   type: 'expense', category: 'Health',           description: 'Apotik K24',            date: 'Mar 11', dayOfWeek: 2, timeOfDay: 20, assetSourceId: 'cash',      isInferred: false, needsReview: false },
  { id: 'r16', amount: 45000,    type: 'expense', category: 'F&B',              description: 'McDonald\'s Drive Thru', date: 'Mar 11', dayOfWeek: 2, timeOfDay: 23, assetSourceId: 'gopay',     isInferred: true,  needsReview: true,  inferenceConfidence: 0.76 },
  { id: 'r17', amount: 189000,   type: 'expense', category: 'Bills & Utilities',description: 'Spotify Premium',       date: 'Mar 10', dayOfWeek: 1, timeOfDay: 10, assetSourceId: 'bni',       isInferred: false, needsReview: false },
  { id: 'r18', amount: 750000,   type: 'expense', category: 'Shopping',         description: 'Zara - Jacket',         date: 'Mar 9',  dayOfWeek: 0, timeOfDay: 15, assetSourceId: 'bca',       isInferred: false, needsReview: false },
  { id: 'r19', amount: 120000,   type: 'expense', category: 'Entertainment',    description: 'CGV Bioskop',           date: 'Mar 8',  dayOfWeek: 6, timeOfDay: 19, assetSourceId: 'ovo',       isInferred: false, needsReview: false },
  { id: 'r20', amount: 60000,    type: 'expense', category: 'F&B',              description: 'Bakso Pak Kumis',       date: 'Mar 8',  dayOfWeek: 6, timeOfDay: 12, assetSourceId: 'cash',      isInferred: true,  needsReview: false },
  { id: 'r21', amount: 38000,    type: 'expense', category: 'Transport',        description: 'Transjakarta Top-up',   date: 'Mar 7',  dayOfWeek: 5, timeOfDay: 7,  assetSourceId: 'bca',       isInferred: false, needsReview: false },
  { id: 'r22', amount: 420000,   type: 'expense', category: 'F&B',              description: 'Friday Dinner BRDG',    date: 'Mar 7',  dayOfWeek: 5, timeOfDay: 20, assetSourceId: 'bca',       isInferred: false, needsReview: false },
  { id: 'r23', amount: 99000,    type: 'expense', category: 'Bills & Utilities',description: 'YouTube Premium',      date: 'Mar 6',  dayOfWeek: 4, timeOfDay: 11, assetSourceId: 'bni',       isInferred: false, needsReview: false },
  { id: 'r24', amount: 175000,   type: 'expense', category: 'F&B',              description: 'Ismaya Cafe Brunch',    date: 'Mar 5',  dayOfWeek: 3, timeOfDay: 11, assetSourceId: 'gopay',     isInferred: false, needsReview: false },
  { id: 'r25', amount: 50000,    type: 'expense', category: 'Transport',        description: 'Grab Express',          date: 'Mar 5',  dayOfWeek: 3, timeOfDay: 16, assetSourceId: 'ovo',       isInferred: true,  needsReview: false },
  { id: 'r26', amount: 2500000,  type: 'expense', category: 'Shopping',         description: 'Tokopedia - Sneakers',  date: 'Mar 4',  dayOfWeek: 2, timeOfDay: 22, assetSourceId: 'shopeepay', isInferred: false, needsReview: false },
  { id: 'r27', amount: 80000,    type: 'expense', category: 'F&B',              description: 'Fore Coffee',           date: 'Mar 3',  dayOfWeek: 1, timeOfDay: 9,  assetSourceId: 'gopay',     isInferred: true,  needsReview: false },
  { id: 'r28', amount: 300000,   type: 'expense', category: 'Health',           description: 'Gym Membership',        date: 'Mar 2',  dayOfWeek: 0, timeOfDay: 7,  assetSourceId: 'bca',       isInferred: false, needsReview: false },
  { id: 'r29', amount: 15000000, type: 'income',  category: 'Income',           description: 'Salary - PT Maju',      date: 'Feb 20', dayOfWeek: 4, timeOfDay: 8,  assetSourceId: 'bca',       isInferred: false, needsReview: false },
  { id: 'r30', amount: 450000,   type: 'expense', category: 'F&B',              description: 'Valentine Dinner',      date: 'Feb 14', dayOfWeek: 5, timeOfDay: 19, assetSourceId: 'bca',       isInferred: false, needsReview: false },
  { id: 'r31', amount: 68000,    type: 'expense', category: 'F&B',              description: 'Starbucks Senayan',     date: 'Feb 12', dayOfWeek: 3, timeOfDay: 15, assetSourceId: 'gopay',     isInferred: true,  needsReview: false },
  { id: 'r32', amount: 185000,   type: 'expense', category: 'Entertainment',    description: 'Netflix',               date: 'Feb 10', dayOfWeek: 1, timeOfDay: 10, assetSourceId: 'bni',       isInferred: false, needsReview: false },
  { id: 'r33', amount: 55000,    type: 'expense', category: 'Transport',        description: 'GoCar Kemang',          date: 'Feb 9',  dayOfWeek: 0, timeOfDay: 20, assetSourceId: 'gopay',     isInferred: true,  needsReview: false },
  { id: 'r34', amount: 890000,   type: 'expense', category: 'Shopping',         description: 'H&M - Weekend Haul',    date: 'Feb 8',  dayOfWeek: 6, timeOfDay: 14, assetSourceId: 'bca',       isInferred: false, needsReview: false },
  { id: 'r35', amount: 110000,   type: 'expense', category: 'F&B',              description: 'Nasi Padang Sederhana', date: 'Feb 7',  dayOfWeek: 5, timeOfDay: 12, assetSourceId: 'cash',      isInferred: true,  needsReview: false },
  { id: 'r36', amount: 480000,   type: 'expense', category: 'F&B',              description: 'Catch Friday Night',    date: 'Feb 7',  dayOfWeek: 5, timeOfDay: 21, assetSourceId: 'bca',       isInferred: false, needsReview: false },
  { id: 'r37', amount: 195000,   type: 'expense', category: 'Bills & Utilities',description: 'Internet Indihome',     date: 'Feb 5',  dayOfWeek: 3, timeOfDay: 9,  assetSourceId: 'bca',       isInferred: false, needsReview: false },
  { id: 'r38', amount: 72000,    type: 'expense', category: 'F&B',              description: 'Kopi Kenangan x2',      date: 'Feb 4',  dayOfWeek: 2, timeOfDay: 8,  assetSourceId: 'gopay',     isInferred: true,  needsReview: false },
  { id: 'r39', amount: 1500000,  type: 'expense', category: 'Shopping',         description: 'Zara - Weekend Sale',   date: 'Feb 1',  dayOfWeek: 6, timeOfDay: 16, assetSourceId: 'bca',       isInferred: false, needsReview: false },
  { id: 'r40', amount: 15000000, type: 'income',  category: 'Income',           description: 'Salary - PT Maju',      date: 'Jan 20', dayOfWeek: 1, timeOfDay: 8,  assetSourceId: 'bca',       isInferred: false, needsReview: false },
  { id: 'r41', amount: 88000,    type: 'expense', category: 'F&B',              description: 'Starbucks Grand Indo',  date: 'Jan 19', dayOfWeek: 0, timeOfDay: 14, assetSourceId: 'gopay',     isInferred: true,  needsReview: false },
  { id: 'r42', amount: 350000,   type: 'expense', category: 'Entertainment',    description: 'Disney+ Annual',        date: 'Jan 18', dayOfWeek: 6, timeOfDay: 11, assetSourceId: 'bni',       isInferred: false, needsReview: false },
  { id: 'r43', amount: 620000,   type: 'expense', category: 'Shopping',         description: 'Tokopedia - Gadget',    date: 'Jan 16', dayOfWeek: 4, timeOfDay: 23, assetSourceId: 'shopeepay', isInferred: false, needsReview: false },
  { id: 'r44', amount: 42000,    type: 'expense', category: 'Transport',        description: 'Grab Food Delivery',    date: 'Jan 14', dayOfWeek: 2, timeOfDay: 20, assetSourceId: 'gopay',     isInferred: true,  needsReview: false },
  { id: 'r45', amount: 160000,   type: 'expense', category: 'F&B',              description: 'Brunch Sunny Side Up',  date: 'Jan 12', dayOfWeek: 0, timeOfDay: 10, assetSourceId: 'bca',       isInferred: false, needsReview: false },
  { id: 'r46', amount: 500000,   type: 'expense', category: 'Bills & Utilities',description: 'PLN Token',             date: 'Jan 10', dayOfWeek: 5, timeOfDay: 9,  assetSourceId: 'bca',       isInferred: false, needsReview: false },
  { id: 'r47', amount: 390000,   type: 'expense', category: 'F&B',              description: 'Friday Crew Dinner',    date: 'Jan 10', dayOfWeek: 5, timeOfDay: 20, assetSourceId: 'bca',       isInferred: false, needsReview: false },
  { id: 'r48', amount: 95000,    type: 'expense', category: 'Health',           description: 'Vitamin Suplemen',      date: 'Jan 8',  dayOfWeek: 3, timeOfDay: 15, assetSourceId: 'gopay',     isInferred: false, needsReview: false },
  { id: 'r49', amount: 78000,    type: 'expense', category: 'F&B',              description: 'Es Teh Indonesia x4',   date: 'Jan 7',  dayOfWeek: 2, timeOfDay: 13, assetSourceId: 'cash',      isInferred: true,  needsReview: false },
  { id: 'r50', amount: 1800000,  type: 'expense', category: 'Shopping',         description: 'New Year Sale Shopee',  date: 'Jan 2',  dayOfWeek: 4, timeOfDay: 0,  assetSourceId: 'shopeepay', isInferred: false, needsReview: false },
  { id: 'r51', amount: 15000000, type: 'income',  category: 'Income',           description: 'Salary - PT Maju',      date: 'Dec 20', dayOfWeek: 5, timeOfDay: 8,  assetSourceId: 'bca',       isInferred: false, needsReview: false },
  { id: 'r52', amount: 3000000,  type: 'income',  category: 'Income',           description: 'Year-end Bonus',        date: 'Dec 20', dayOfWeek: 5, timeOfDay: 8,  assetSourceId: 'bca',       isInferred: false, needsReview: false },
  { id: 'r53', amount: 2200000,  type: 'expense', category: 'Shopping',         description: 'Harbolnas 12.12',       date: 'Dec 12', dayOfWeek: 4, timeOfDay: 0,  assetSourceId: 'shopeepay', isInferred: false, needsReview: false },
  { id: 'r54', amount: 580000,   type: 'expense', category: 'Entertainment',    description: 'Djakarta Warehouse',    date: 'Dec 7',  dayOfWeek: 6, timeOfDay: 21, assetSourceId: 'gopay',     isInferred: false, needsReview: false },
  { id: 'r55', amount: 145000,   type: 'expense', category: 'F&B',              description: 'Holywings Saturday',   date: 'Dec 7',  dayOfWeek: 6, timeOfDay: 22, assetSourceId: 'cash',      isInferred: true,  needsReview: false },
  { id: 'r56', amount: 68000,    type: 'expense', category: 'F&B',              description: 'Starbucks Pondok',      date: 'Dec 5',  dayOfWeek: 4, timeOfDay: 8,  assetSourceId: 'gopay',     isInferred: true,  needsReview: false },
  { id: 'r57', amount: 220000,   type: 'expense', category: 'Transport',        description: 'Toll + Bensin Weekend', date: 'Dec 1',  dayOfWeek: 0, timeOfDay: 9,  assetSourceId: 'bca',       isInferred: false, needsReview: false },
  { id: 'r58', amount: 430000,   type: 'expense', category: 'F&B',              description: 'Friday Dinner Seribu', date: 'Nov 29', dayOfWeek: 5, timeOfDay: 20, assetSourceId: 'bca',       isInferred: false, needsReview: false },
  { id: 'r59', amount: 186000,   type: 'expense', category: 'Bills & Utilities',description: 'Netflix',               date: 'Nov 19', dayOfWeek: 2, timeOfDay: 11, assetSourceId: 'bni',       isInferred: false, needsReview: false },
  { id: 'r60', amount: 15000000, type: 'income',  category: 'Income',           description: 'Salary - PT Maju',      date: 'Nov 20', dayOfWeek: 3, timeOfDay: 8,  assetSourceId: 'bca',       isInferred: false, needsReview: false },
]
