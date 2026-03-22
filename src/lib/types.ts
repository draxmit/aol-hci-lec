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
