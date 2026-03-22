export type TransactionCategory = 'F&B' | 'Entertainment' | 'Transport' | 'Shopping' | 'Health' | 'Bills & Utilities' | 'Investment' | 'Income' | 'Transfer' | 'Other'
export type TransactionType = 'expense' | 'income' | 'transfer'
export type AssetType = 'fiat' | 'crypto' | 'physical' | 'investment'
export type LiquidityLevel = 'liquid' | 'semi-liquid' | 'illiquid'
export type InsightSeverity = 'info' | 'warning' | 'critical'

export interface Transaction {
  id: string
  amount: number
  type: TransactionType
  category: TransactionCategory
  description: string
  date: string
  dayOfWeek: number
  timeOfDay: number
  assetSourceId: string
  originalRawText?: string
  isInferred: boolean
  needsReview: boolean
  inferenceConfidence?: number
}

export interface AssetSource {
  id: string
  name: string
  type: AssetType
  liquidityLevel: LiquidityLevel
  balance: number
  currency: string
  icon?: string
}

export interface AssetPortfolio {
  totalNetWorth: number
  liquidRatio: number
  assets: AssetSource[]
  breakdown: { fiat: number; crypto: number; physical: number; investment: number }
}

export interface BehavioralInsight {
  id: string
  title: string
  description: string
  probability: number
  severity: InsightSeverity
  affectedCategory: TransactionCategory
  historicalAverage: number
  confidenceInterval: [number, number]
  isDismissed: boolean
}

export interface SimulatorVariable {
  id: string
  label: string
  monthlyAmount: number
  durationMonths: number
  type: 'expense' | 'income'
}

export type Page = 'dashboard' | 'transactions' | 'insights' | 'simulator'

// ─── What-If Simulator ────────────────────────────────────────────────────────
export interface FinancialGoal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  targetDate: string       // ISO date string
  icon: string
}

export interface DailyProjection {
  date: string             // "Apr 1", "Apr 2" …
  isoDate: string          // full ISO for sorting
  expectedBalance: number
  upperBound: number       // p75 confidence
  lowerBound: number       // p25 confidence
  worstCase: number        // p10
  bestCase: number         // p90
  isNegative: boolean      // lower bound < 0
}

export interface DelayedGoal {
  goal: FinancialGoal
  originalDaysRemaining: number
  newDaysRemaining: number
  delayDays: number
}

export interface OptimalDateRecommendation {
  date: string
  isoDate: string
  overdraftRiskReduction: number  // percentage
  reason: string
}

export interface SimulationResult {
  projections: DailyProjection[]
  minBalance: number
  overdraftRisk: number           // probability 0–1 that balance goes negative
  delayedGoals: DelayedGoal[]
  optimalDateRecommendation: OptimalDateRecommendation | null
  impactOnSavingsRate: number     // percentage point change
}
