import { BehavioralInsightsCard } from '../components/insights/BehavioralInsightsCard'
import { INSIGHTS } from '../lib/mock-data'
import { useReveal } from '../hooks/useReveal'

export function InsightsPage() {
  useReveal()
  return <BehavioralInsightsCard insights={INSIGHTS} />
}
