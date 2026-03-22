import { TimeMachineSimulator } from '../components/simulator/TimeMachineSimulator'
import { useReveal } from '../hooks/useReveal'

export function SimulatorPage() {
  useReveal()
  return <TimeMachineSimulator />
}
