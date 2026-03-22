/**
 * Probabilistic What-If Engine
 *
 * Models daily cash flow over the next 30 days using:
 * - Historical income/expense patterns to derive mean + volatility per day-of-week
 * - Monte Carlo: 500 random walks per scenario to build confidence bands
 * - Goal impact: calculates how a one-off expense shifts each goal's completion date
 * - Optimal purchase date: scans the 30-day window for the lowest overdraft-risk day
 */

import type {
  Transaction,
  DailyProjection,
  SimulationResult,
  FinancialGoal,
  DelayedGoal,
  OptimalDateRecommendation,
} from './types'

const N_SIMULATIONS = 500

// ─── Derive daily cash flow stats from transaction history ────────────────────
interface DayCashFlow {
  meanNetFlow: number   // income - expenses for this day-of-week (0=Sun..6=Sat)
  stdNetFlow:  number
}

function mean(arr: number[]): number {
  return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0
}
function std(arr: number[], m?: number): number {
  if (arr.length < 2) return Math.abs(m ?? 0) * 0.3 + 20_000
  const mu = m ?? mean(arr)
  return Math.sqrt(arr.reduce((a, b) => a + (b - mu) ** 2, 0) / arr.length) || 20_000
}

// Box-Muller: generate standard normal sample
function randn(): number {
  let u = 0, v = 0
  while (u === 0) u = Math.random()
  while (v === 0) v = Math.random()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

export function buildDayCashFlows(txs: Transaction[]): DayCashFlow[] {
  // Group net flows by day-of-week
  const flowsByDay: number[][] = Array.from({ length: 7 }, () => [])

  // Aggregate per (date, dayOfWeek)
  const byDate: Record<string, { dow: number; net: number }> = {}
  txs.forEach(t => {
    if (!byDate[t.date]) byDate[t.date] = { dow: t.dayOfWeek, net: 0 }
    byDate[t.date].net += t.type === 'income' ? t.amount : -t.amount
  })
  Object.values(byDate).forEach(({ dow, net }) => flowsByDay[dow].push(net))

  // Fall back to generic priors when data is thin
  const PRIORS = [-50_000, -80_000, -70_000, -75_000, -90_000, -120_000, -60_000]
  const PRIOR_STD = 60_000

  return flowsByDay.map((flows, dow) => {
    if (flows.length < 3) return { meanNetFlow: PRIORS[dow], stdNetFlow: PRIOR_STD }
    const m = mean(flows)
    return { meanNetFlow: m, stdNetFlow: std(flows, m) }
  })
}

// ─── Core simulation ──────────────────────────────────────────────────────────
export function runSimulation(
  currentBalance: number,
  purchaseAmount: number,
  purchaseDayOffset: number,   // 0 = today, 1 = tomorrow, …, 29 = day 30
  dayCashFlows: DayCashFlow[],
  goals: FinancialGoal[],
  today: Date = new Date(),
): SimulationResult {

  const DAYS = 30

  // Run N_SIMULATIONS Monte Carlo paths
  const paths: number[][] = Array.from({ length: N_SIMULATIONS }, () => {
    const path: number[] = []
    let balance = currentBalance
    for (let d = 0; d < DAYS; d++) {
      if (d === purchaseDayOffset) balance -= purchaseAmount
      const dow = (today.getDay() + d) % 7
      const cf = dayCashFlows[dow]
      balance += cf.meanNetFlow + randn() * cf.stdNetFlow
      path.push(balance)
    }
    return path
  })

  // Also run a baseline (no purchase) for goal comparison
  const baselinePaths: number[][] = Array.from({ length: N_SIMULATIONS }, () => {
    const path: number[] = []
    let balance = currentBalance
    for (let d = 0; d < DAYS; d++) {
      const dow = (today.getDay() + d) % 7
      const cf = dayCashFlows[dow]
      balance += cf.meanNetFlow + randn() * cf.stdNetFlow
      path.push(balance)
    }
    return path
  })

  // Build percentile bands per day
  const projections: DailyProjection[] = Array.from({ length: DAYS }, (_, d) => {
    const dayBalances = paths.map(p => p[d]).sort((a, b) => a - b)
    const p10 = dayBalances[Math.floor(N_SIMULATIONS * 0.10)]
    const p25 = dayBalances[Math.floor(N_SIMULATIONS * 0.25)]
    const p50 = dayBalances[Math.floor(N_SIMULATIONS * 0.50)]
    const p75 = dayBalances[Math.floor(N_SIMULATIONS * 0.75)]
    const p90 = dayBalances[Math.floor(N_SIMULATIONS * 0.90)]

    const date = new Date(today)
    date.setDate(today.getDate() + d)
    const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const isoDate = date.toISOString().split('T')[0]

    return {
      date: label,
      isoDate,
      expectedBalance: p50,
      upperBound: p75,
      lowerBound: p25,
      worstCase: p10,
      bestCase: p90,
      isNegative: p25 < 0,
    }
  })

  // Overdraft risk: fraction of simulations where balance dips below 0 at any point
  const overdraftCount = paths.filter(p => p.some(b => b < 0)).length
  const overdraftRisk = overdraftCount / N_SIMULATIONS

  const minBalance = Math.min(...projections.map(p => p.lowerBound))

  // ── Goal impact ────────────────────────────────────────────────────────────
  // Estimate daily savings rate from baseline end balance
  const baselineEndBalances = baselinePaths.map(p => p[DAYS - 1])
  const baselineMeanEnd = mean(baselineEndBalances)
  const dailySavingsRate = Math.max(0, (baselineMeanEnd - currentBalance) / DAYS)

  const withPurchaseEnd = mean(paths.map(p => p[DAYS - 1]))
  const dailySavingsRateWithPurchase = Math.max(0, (withPurchaseEnd - currentBalance) / DAYS)
  const savingsRateDelta = dailySavingsRateWithPurchase - dailySavingsRate

  const delayedGoals: DelayedGoal[] = []
  for (const goal of goals) {
    const needed = goal.targetAmount - goal.currentAmount
    if (needed <= 0) continue

    const originalDays = dailySavingsRate > 0
      ? Math.ceil(needed / dailySavingsRate)
      : 9999

    // With purchase: savings rate drops + immediate balance reduction
    const neededAfterPurchase = needed + purchaseAmount
    const newDays = dailySavingsRateWithPurchase > 0
      ? Math.ceil(neededAfterPurchase / dailySavingsRateWithPurchase)
      : 9999

    const delayDays = newDays - originalDays
    if (delayDays > 3) {
      delayedGoals.push({
        goal,
        originalDaysRemaining: originalDays,
        newDaysRemaining: newDays,
        delayDays,
      })
    }
  }

  // ── Optimal date recommendation ────────────────────────────────────────────
  let optimalDateRecommendation: OptimalDateRecommendation | null = null

  if (overdraftRisk > 0.05 && purchaseAmount > 0) {
    // Find the day in the next 30 that minimises overdraft risk
    let bestDay = purchaseDayOffset
    let bestRisk = overdraftRisk

    for (let d = 0; d < DAYS; d++) {
      if (d === purchaseDayOffset) continue
      const testPaths = Array.from({ length: 200 }, () => {
        let balance = currentBalance
        for (let dd = 0; dd < DAYS; dd++) {
          if (dd === d) balance -= purchaseAmount
          const dow = (today.getDay() + dd) % 7
          const cf = dayCashFlows[dow]
          balance += cf.meanNetFlow + randn() * cf.stdNetFlow
        }
        return balance
      })
      const risk = testPaths.filter(b => b < 0).length / 200
      if (risk < bestRisk) { bestRisk = risk; bestDay = d }
    }

    if (bestDay !== purchaseDayOffset) {
      const optDate = new Date(today)
      optDate.setDate(today.getDate() + bestDay)
      const reduction = Math.round((overdraftRisk - bestRisk) * 100)
      optimalDateRecommendation = {
        date: optDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }),
        isoDate: optDate.toISOString().split('T')[0],
        overdraftRiskReduction: reduction,
        reason: bestDay > purchaseDayOffset
          ? `Post-salary period gives you ${reduction}% lower overdraft risk`
          : `Earlier purchase avoids a high-spend window`,
      }
    }
  }

  const impactOnSavingsRate = savingsRateDelta / Math.max(dailySavingsRate, 1) * 100

  return {
    projections,
    minBalance,
    overdraftRisk,
    delayedGoals,
    optimalDateRecommendation,
    impactOnSavingsRate,
  }
}
