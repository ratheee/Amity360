import { Check, ChevronRight, Circle, LoaderCircle } from 'lucide-react'
import type { ModuleKey } from '../../types'
import { modules } from '../../data/modules'
import { announcementCategoryLabels } from '../../data/labels'
import { phases, techStack } from '../../data/plan'
import { PROJECT_PROGRESS } from '../../config'
import { useCurrentUser } from '../../context/AuthContext'
import { useAsync } from '../../hooks/useAsync'
import { api } from '../../services/api'
import { Badge, Panel } from '../../components/ui'
import { greeting, timeAgo } from '../../utils/format'

const phaseIcons = { done: Check, current: LoaderCircle, upcoming: Circle }

/** Dashboard shown in review mode: module overview, project progress and tech stack. */
export function ReviewDashboardPage({ navigate }: { navigate: (key: ModuleKey) => void }) {
  const user = useCurrentUser()
  const notices = useAsync(() => api.announcements.list(), [])
  const today = new Date()

  return (
    <>
      <section className="welcome">
        <div>
          <span className="eyebrow">{today.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase()}</span>
          <h1>{greeting()}, {user.name.replace(/^(Dr\.|Prof\.)\s*/, '').split(' ')[0]}!</h1>
          <p>Amity 360 – one platform for every campus service.</p>
        </div>
        <div className="campus-status"><span className="status-dev" /><div><strong>Project status</strong><small>{PROJECT_PROGRESS}% complete · Frontend completed</small></div></div>
      </section>

      <section className="quick-grid">
        {modules.slice(1).map(({ key, label, description, icon: Icon }, index) => (
          <button className="quick-card" key={key} onClick={() => navigate(key)}>
            <div className={`quick-icon tone-${index + 1}`}><Icon /></div>
            <div><strong>{label}</strong><span>{description}</span></div><ChevronRight className="arrow" />
          </button>
        ))}
      </section>

      <Panel eyebrow="NOTICES" title="Campus notices" className="announcements review-notices">
        {notices.data?.slice(0, 3).map(item => (
          <article key={item.id}>
            <div className={`notice-mark ${item.pinned ? 'gold' : ''}`} />
            <div><span>{announcementCategoryLabels[item.category]} · {timeAgo(item.createdAt)}</span><strong>{item.title}</strong></div>
          </article>
        ))}
      </Panel>

      <div className="two-col">
        <Panel eyebrow="PROJECT PROGRESS" title="Development roadmap" action={<span className="percent">{PROJECT_PROGRESS}%</span>}>
          <div className="progress"><span style={{ width: `${PROJECT_PROGRESS}%` }} /></div>
          <ol className="phase-list">
            {phases.map(phase => {
              const Icon = phaseIcons[phase.status]
              return (
                <li key={phase.name} className={`phase-${phase.status}`}>
                  <span className="phase-icon"><Icon /></span>
                  <div><strong>{phase.name}</strong><small>{phase.detail}</small></div>
                  <Badge tone={phase.status === 'done' ? 'green' : phase.status === 'current' ? 'gold' : 'gray'}>
                    {phase.status === 'done' ? 'Completed' : phase.status === 'current' ? 'Next' : 'Planned'}
                  </Badge>
                </li>
              )
            })}
          </ol>
        </Panel>

        <Panel eyebrow="TECHNOLOGIES" title="Technology stack">
          <div className="tech-list">
            {techStack.map(group => (
              <div key={group.layer} className="tech-row">
                <span>{group.layer}</span>
                <div className="tag-list">{group.items.map(item => <Badge key={item} tone="blue">{item}</Badge>)}</div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </>
  )
}
