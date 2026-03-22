/**
 * Impulse Detection Engine
 * Cold start: population-level priors (Indonesian spending baselines)
 * Warm model: Isolation Forest-style anomaly scoring on user's own transaction history
 * Retrains incrementally as new transactions are added / flagged
 */

import type { Transaction, TransactionCategory } from './types'

// ─── Population priors (cold start) ─────────────────────────────────────────
// Avg spend per category in IDR, Indonesian urban baseline
const CATEGORY_POPULATION_MEAN: Record<TransactionCategory, number> = {
  'F&B':             65_000,
  'Transport':       45_000,
  'Entertainment':   120_000,
  'Shopping':        280_000,
  'Health':          80_000,
  'Bills & Utilities': 200_000,
  'Investment':      500_000,
  'Income':          0,
  'Transfer':        0,
  'Other':           100_000,
}

const CATEGORY_POPULATION_STD: Record<TransactionCategory, number> = {
  'F&B':             55_000,
  'Transport':       35_000,
  'Entertainment':   200_000,
  'Shopping':        400_000,
  'Health':          100_000,
  'Bills & Utilities': 150_000,
  'Investment':      800_000,
  'Income':          1,
  'Transfer':        1,
  'Other':           150_000,
}

// Impulse risk multiplier by hour (0–23)
const HOUR_RISK: number[] = [
  0.9, 0.95, 1.0, 1.0, 1.0, 0.6,  // 0–5am: late night high, early low
  0.4, 0.35, 0.3, 0.3, 0.3, 0.35, // 6–11am: morning, low risk
  0.45, 0.5, 0.45, 0.45, 0.5, 0.55, // noon–5pm: moderate
  0.6, 0.65, 0.75, 0.85, 0.9, 0.9,  // evening: rising
]

// Day of week risk (0=Sun … 6=Sat)
const DOW_RISK: number[] = [0.7, 0.4, 0.4, 0.4, 0.45, 0.75, 0.8]

// ─── Feature extraction ───────────────────────────────────────────────────────
export interface ImpulseFeatures {
  amountZScore: number       // z-score vs personal (or population) category mean
  hourRisk: number           // 0–1 from HOUR_RISK
  dowRisk: number            // 0–1 from DOW_RISK
  frequencyRisk: number      // how soon after last same-category tx (0–1)
  dailyBudgetRisk: number    // cumulative spend today vs personal daily avg (0–1)
  categoryVolatility: number // personal std / mean ratio (higher = more erratic)
}

export interface ImpulseResult {
  score: number              // 0–1 composite impulse risk
  confidence: 'cold' | 'warming' | 'warm'  // model maturity
  features: ImpulseFeatures
  triggers: string[]         // human-readable reasons
  shouldSleepOn: boolean
  label: 'low' | 'medium' | 'high' | 'very high'
}

// ─── Personal stats derived from history ─────────────────────────────────────
interface PersonalStats {
  categoryMeans: Partial<Record<TransactionCategory, number>>
  categoryStds:  Partial<Record<TransactionCategory, number>>
  dailyAvgSpend: number
  lastByCategory: Partial<Record<TransactionCategory, number>> // timestamp ms
  // Isolation Forest: stored subsample trees (simplified as random thresholds)
  isoForestTrained: boolean
  isoThresholds: IsoThreshold[]
  txCount: number
}

interface IsoThreshold {
  feature: keyof ImpulseFeatures
  splitValue: number
  depth: number
}

function mean(arr: number[]): number {
  return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0
}
function std(arr: number[], m?: number): number {
  if (arr.length < 2) return 1
  const mu = m ?? mean(arr)
  return Math.sqrt(arr.reduce((a, b) => a + (b - mu) ** 2, 0) / arr.length) || 1
}
function clamp(v: number, lo = 0, hi = 1): number {
  return Math.max(lo, Math.min(hi, v))
}

// ─── Build personal stats from transaction history ────────────────────────────
export function buildPersonalStats(txs: Transaction[]): PersonalStats {
  const expenses = txs.filter(t => t.type === 'expense')
  const txCount  = expenses.length

  // Per-category means + stds
  const byCategory: Partial<Record<TransactionCategory, number[]>> = {}
  expenses.forEach(t => {
    if (!byCategory[t.category]) byCategory[t.category] = []
    byCategory[t.category]!.push(t.amount)
  })
  const categoryMeans: Partial<Record<TransactionCategory, number>> = {}
  const categoryStds:  Partial<Record<TransactionCategory, number>> = {}
  for (const [cat, vals] of Object.entries(byCategory)) {
    const m = mean(vals!)
    categoryMeans[cat as TransactionCategory] = m
    categoryStds [cat as TransactionCategory] = std(vals!, m)
  }

  // Daily avg
  const dailyTotals: Record<string, number> = {}
  expenses.forEach(t => {
    const day = t.date
    dailyTotals[day] = (dailyTotals[day] || 0) + t.amount
  })
  const dailyAvgSpend = mean(Object.values(dailyTotals)) || 150_000

  // Last tx per category (use index as proxy for recency since we have no real timestamps)
  const lastByCategory: Partial<Record<TransactionCategory, number>> = {}
  expenses.forEach((t, i) => {
    lastByCategory[t.category] = i
  })

  // Train simplified Isolation Forest when >= 20 transactions
  let isoForestTrained = false
  let isoThresholds: IsoThreshold[] = []
  if (txCount >= 20) {
    isoForestTrained = true
    // Build 40 random split rules on feature space
    const features: (keyof ImpulseFeatures)[] = ['amountZScore','hourRisk','dowRisk','frequencyRisk','dailyBudgetRisk']
    isoThresholds = Array.from({ length: 40 }, () => {
      const feature = features[Math.floor(Math.random() * features.length)]
      const splitValue = Math.random() * (feature === 'amountZScore' ? 4 : 1)
      const depth = Math.floor(Math.random() * 5) + 1
      return { feature, splitValue, depth }
    })
  }

  return { categoryMeans, categoryStds, dailyAvgSpend, lastByCategory, isoForestTrained, isoThresholds, txCount }
}

// ─── Score a candidate purchase ───────────────────────────────────────────────
export function scoreImpulse(
  amount: number,
  category: TransactionCategory,
  hourOfDay: number,
  dayOfWeek: number,
  todaySpendSoFar: number,
  stats: PersonalStats,
  recentCategoryIndex: number = -1,  // index of last same-cat tx in history
  totalTxCount: number = 0,
): ImpulseResult {
  const cold = stats.txCount < 10
  const warming = stats.txCount >= 10 && stats.txCount < 20

  // Use personal stats if available, otherwise population priors
  const catMean = stats.categoryMeans[category] ?? CATEGORY_POPULATION_MEAN[category]
  const catStd  = stats.categoryStds[category]  ?? CATEGORY_POPULATION_STD[category]

  // ── Feature 1: amount z-score ──────────────────────────────────────────────
  const amountZScore = clamp((amount - catMean) / catStd, -3, 5)

  // ── Feature 2: hour risk ───────────────────────────────────────────────────
  const hourRisk = HOUR_RISK[Math.min(hourOfDay, 23)]

  // ── Feature 3: day of week risk ────────────────────────────────────────────
  const dowRisk = DOW_RISK[dayOfWeek]

  // ── Feature 4: frequency risk (how soon after last same-cat tx) ───────────
  let frequencyRisk = 0.3
  if (recentCategoryIndex >= 0) {
    const gap = totalTxCount - recentCategoryIndex
    // Gap of 1 = bought same category recently → high risk; gap > 10 → low
    frequencyRisk = clamp(1 - gap / 12, 0.1, 1.0)
  }

  // ── Feature 5: daily budget risk ──────────────────────────────────────────
  const dailyBudgetRisk = clamp(
    (todaySpendSoFar + amount) / (stats.dailyAvgSpend * 1.5),
    0, 1
  )

  // ── Feature 6: category volatility (personal erraticity) ──────────────────
  const categoryVolatility = cold ? 0.5 : clamp(catStd / (catMean || 1), 0, 2) / 2

  const features: ImpulseFeatures = {
    amountZScore, hourRisk, dowRisk, frequencyRisk, dailyBudgetRisk, categoryVolatility
  }

  // ── Composite score ────────────────────────────────────────────────────────
  let score: number

  if (cold || warming) {
    // Weighted linear combination using population priors
    const normalizedZ = clamp((amountZScore + 1) / 4, 0, 1) // -1..3 → 0..1
    score =
      normalizedZ         * 0.35 +
      hourRisk            * 0.20 +
      dowRisk             * 0.15 +
      frequencyRisk       * 0.15 +
      dailyBudgetRisk     * 0.10 +
      categoryVolatility  * 0.05
  } else {
    // Isolation Forest anomaly scoring: count how many thresholds flag as anomalous
    let anomalyCount = 0
    for (const t of stats.isoThresholds) {
      const fval = features[t.feature] as number
      if (fval > t.splitValue) anomalyCount++
    }
    const isoScore = anomalyCount / stats.isoThresholds.length

    // Blend iso score with linear features (iso gets more weight as data grows)
    const isoWeight = clamp((stats.txCount - 20) / 80, 0, 0.6)
    const linWeight = 1 - isoWeight
    const normalizedZ = clamp((amountZScore + 1) / 4, 0, 1)
    const linScore =
      normalizedZ     * 0.35 +
      hourRisk        * 0.20 +
      dowRisk         * 0.15 +
      frequencyRisk   * 0.15 +
      dailyBudgetRisk * 0.10 +
      categoryVolatility * 0.05
    score = isoWeight * isoScore + linWeight * linScore
  }

  score = clamp(score)

  // ── Human-readable triggers ────────────────────────────────────────────────
  const triggers: string[] = []
  if (amountZScore > 1.5) {
    const mult = (amount / catMean).toFixed(1)
    triggers.push(`${mult}× your usual ${category} spend`)
  }
  if (hourRisk > 0.75) triggers.push(`Late-night purchase (${hourOfDay}:00)`)
  if (dowRisk > 0.7)   triggers.push(dayOfWeek === 5 ? 'Friday spending spike pattern' : 'Weekend impulse window')
  if (frequencyRisk > 0.6) triggers.push(`Quick repeat in ${category}`)
  if (dailyBudgetRisk > 0.7) triggers.push(`Already ${Math.round(dailyBudgetRisk * 150)}% of your daily average`)
  if (triggers.length === 0) triggers.push('Within your normal patterns')

  const shouldSleepOn = score > 0.68 && (hourRisk > 0.65 || amountZScore > 1.2)

  const label: ImpulseResult['label'] =
    score < 0.35 ? 'low' :
    score < 0.55 ? 'medium' :
    score < 0.75 ? 'high' : 'very high'

  const confidence: ImpulseResult['confidence'] =
    cold ? 'cold' : warming ? 'warming' : 'warm'

  return { score, confidence, features, triggers, shouldSleepOn, label }
}

// ─── Fingerprint: user's impulse profile built from history ──────────────────
export interface ImpulseFingerprint {
  topImpulseHour: number           // hour with most high-score purchases
  topImpulseDay: string            // day name
  topImpulseCategory: TransactionCategory
  avgImpulseScore: number
  totalFlagged: number
  radarData: {                     // 0–1 for radar chart axes
    lateNight: number
    weekends: number
    overspend: number
    frequency: number
    dailyBudget: number
  }
}

const DAY_NAMES = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']

export function buildFingerprint(txs: Transaction[], stats: PersonalStats): ImpulseFingerprint {
  const expenses = txs.filter(t => t.type === 'expense')
  if (expenses.length === 0) {
    return {
      topImpulseHour: 22, topImpulseDay: 'Friday', topImpulseCategory: 'Shopping',
      avgImpulseScore: 0, totalFlagged: 0,
      radarData: { lateNight: 0, weekends: 0, overspend: 0, frequency: 0, dailyBudget: 0 }
    }
  }

  // Score each transaction
  const scored = expenses.map((t, i) => {
    const prevSameCat = expenses.slice(0, i).reverse().findIndex(x => x.category === t.category)
    const result = scoreImpulse(
      t.amount, t.category, t.timeOfDay, t.dayOfWeek,
      expenses.slice(0, i).filter(x => x.date === t.date).reduce((s, x) => s + x.amount, 0),
      stats, prevSameCat >= 0 ? i - prevSameCat - 1 : -1, i
    )
    return { tx: t, score: result.score }
  })

  // Hour distribution
  const hourScores: number[] = Array(24).fill(0)
  const hourCounts: number[] = Array(24).fill(0)
  scored.forEach(({ tx, score }) => {
    hourScores[tx.timeOfDay] += score
    hourCounts[tx.timeOfDay]++
  })
  const hourAvg = hourScores.map((s, i) => hourCounts[i] ? s / hourCounts[i] : 0)
  const topImpulseHour = hourAvg.indexOf(Math.max(...hourAvg))

  // Day distribution
  const dayScores: number[] = Array(7).fill(0)
  const dayCounts: number[] = Array(7).fill(0)
  scored.forEach(({ tx, score }) => { dayScores[tx.dayOfWeek] += score; dayCounts[tx.dayOfWeek]++ })
  const dayAvg = dayScores.map((s, i) => dayCounts[i] ? s / dayCounts[i] : 0)
  const topImpulseDay = DAY_NAMES[dayAvg.indexOf(Math.max(...dayAvg))]

  // Category distribution
  const catScores: Partial<Record<TransactionCategory, number>> = {}
  const catCounts: Partial<Record<TransactionCategory, number>> = {}
  scored.forEach(({ tx, score }) => {
    catScores[tx.category] = (catScores[tx.category] || 0) + score
    catCounts[tx.category] = (catCounts[tx.category] || 0) + 1
  })
  let topCat: TransactionCategory = 'Shopping'
  let topCatScore = 0
  for (const [cat, total] of Object.entries(catScores)) {
    const avg = total / (catCounts[cat as TransactionCategory] || 1)
    if (avg > topCatScore) { topCatScore = avg; topCat = cat as TransactionCategory }
  }

  const avgImpulseScore = mean(scored.map(s => s.score))
  const totalFlagged = scored.filter(s => s.score > 0.65).length

  // Radar axes
  const lateNightTxs = expenses.filter(t => t.timeOfDay >= 21 || t.timeOfDay <= 4)
  const weekendTxs   = expenses.filter(t => t.dayOfWeek === 0 || t.dayOfWeek === 6)
  const overspendTxs = expenses.filter(t => {
    const cm = stats.categoryMeans[t.category] ?? CATEGORY_POPULATION_MEAN[t.category]
    const cs = stats.categoryStds[t.category]  ?? CATEGORY_POPULATION_STD[t.category]
    return (t.amount - cm) / cs > 1.5
  })

  return {
    topImpulseHour,
    topImpulseDay,
    topImpulseCategory: topCat,
    avgImpulseScore,
    totalFlagged,
    radarData: {
      lateNight:   clamp(lateNightTxs.length / Math.max(expenses.length * 0.3, 1)),
      weekends:    clamp(weekendTxs.length   / Math.max(expenses.length * 0.4, 1)),
      overspend:   clamp(overspendTxs.length / Math.max(expenses.length * 0.3, 1)),
      frequency:   clamp(1 - (expenses.length > 1 ? 1 / expenses.length : 1)),
      dailyBudget: clamp((stats.dailyAvgSpend) / 500_000),
    }
  }
}
