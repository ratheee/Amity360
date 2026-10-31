import { CheckCircle2, Users } from 'lucide-react'
import type { ModuleKey } from '../../types'
import { modulePlans } from '../../data/plan'
import { Badge, PageHeader, Panel } from '../../components/ui'

/** Design page for a module in review mode: target users, planned features and workflow. */
export function PlannedModulePage({ module }: { module: ModuleKey }) {
  const plan = modulePlans[module]
  if (!plan) return null

  return (
    <>
      <PageHeader module={module} subtitle="Requirement analysis and design completed. Development is scheduled in the next phase." actions={<Badge tone="gold">Designed · In development</Badge>} />

      <div className="plan-users"><Users /> <span><strong>Users:</strong> {plan.users}</span></div>

      <div className="two-col">
        <Panel eyebrow="REQUIREMENTS" title="Planned features">
          <ul className="feature-list">
            {plan.features.map(item => <li key={item}><CheckCircle2 />{item}</li>)}
          </ul>
        </Panel>
        <Panel eyebrow="DESIGN" title="Module workflow">
          <ol className="workflow">
            {plan.workflow.map((step, index) => (
              <li key={step}><span>{index + 1}</span><p>{step}</p></li>
            ))}
          </ol>
        </Panel>
      </div>
    </>
  )
}
