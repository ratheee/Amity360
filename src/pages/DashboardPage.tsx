import { CalendarClock, ChevronRight, CircleAlert, UtensilsCrossed } from 'lucide-react'
import type { MealType, ModuleKey } from '../types'
import { canAccess, modules } from '../data/modules'
import { announcementCategoryLabels, mealLabels, mealOrder, mealTimes } from '../data/labels'
import { useCurrentUser } from '../context/auth'
import { useAsync } from '../hooks/useAsync'
import { api } from '../services/api'
import { Badge, EmptyState, Panel, StatusBadge } from '../components/ui'
import { daysUntil, formatDate, greeting, timeAgo } from '../utils/format'

const toneByCategory = { academic: 'blue', event: 'gold', campus: 'green', sports: 'teal', placement: 'purple' } as const

/** The meal currently being served, or the next one, based on the hour. */
const currentMeal = (hour = new Date().getHours()): MealType => (hour < 10 ? 'breakfast' : hour < 15 ? 'lunch' : hour < 18 ? 'snacks' : 'dinner')

export function DashboardPage({ navigate }: { navigate: (key: ModuleKey) => void }) {
  const user = useCurrentUser()
  const data = useAsync(async () => {
    const [announcements, assignments, complaints] = await Promise.all([api.announcements.list(), api.assignments.list(), api.complaints.list(user)])
    return { announcements, assignments, complaints }
  }, [user.id])

  const today = new Date()
  const dayMenu = api.mess.menu()[(today.getDay() + 6) % 7]
  const meal = currentMeal()
  const deadlines = data.data?.assignments.filter(item => daysUntil(item.dueDate) >= 0).slice(0, 4) ?? []
  const activeComplaints = data.data?.complaints.filter(item => item.status === 'open' || item.status === 'in_progress') ?? []

  return (
    <>
      <section className="welcome">
        <div>
          <span className="eyebrow">{today.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase()}</span>
          <h1>{greeting()}, {user.name.replace(/^(Dr\.|Prof\.)\s*/, '').split(' ')[0]}!</h1>
          <p>Here’s what’s happening around your campus today.</p>
        </div>
        <div className="campus-status"><span /><div><strong>Campus is open</strong><small>All services operating normally</small></div></div>
      </section>

      <section className="quick-grid">
        {modules.slice(1).filter(item => canAccess(item.key, user.role)).map(({ key, label, description, icon: Icon }) => (
          <button className="quick-card" key={key} onClick={() => navigate(key)}>
            <div className={`quick-icon tone-${modules.findIndex(item => item.key === key)}`}><Icon /></div>
            <div><strong>{label}</strong><span>{description}</span></div><ChevronRight className="arrow" />
          </button>
        ))}
      </section>

      <div className="dashboard-grid">
        <Panel eyebrow="DEADLINES" title={user.role === 'student' ? 'Upcoming assignments' : 'Active assignments'} action={<button onClick={() => navigate('resources')}>View all</button>} className="span-rows">
          {deadlines.length ? deadlines.map(item => {
            const days = daysUntil(item.dueDate)
            const submitted = item.submissions.some(sub => sub.userId === user.id)
            return (
              <div className="list-row" key={item.id}>
                <div className="date-chip"><strong>{new Date(item.dueDate).getDate()}</strong><span>{formatDate(item.dueDate, { month: 'short' })}</span></div>
                <div className="list-main"><strong>{item.title}</strong><span>{item.subject}</span></div>
                {user.role === 'student'
                  ? submitted ? <Badge tone="green">Submitted</Badge> : <Badge tone={days <= 1 ? 'red' : 'gold'}>{days === 0 ? 'Due today' : `${days}d left`}</Badge>
                  : <Badge tone="blue">{item.submissions.length} submitted</Badge>}
              </div>
            )
          }) : <EmptyState icon={<CalendarClock />} title={data.loading ? 'Loading…' : 'No upcoming deadlines'} />}
        </Panel>

        <Panel eyebrow="LATEST" title="Campus updates" action={<button onClick={() => navigate('updates')}>View all</button>} className="announcements">
          {data.data?.announcements.slice(0, 3).map(item => (
            <article key={item.id}>
              <div className={`notice-mark ${toneByCategory[item.category]}`} />
              <div><span>{announcementCategoryLabels[item.category]} · {timeAgo(item.createdAt)}</span><strong>{item.title}</strong></div>
            </article>
          ))}
        </Panel>

        <Panel eyebrow={`${mealTimes[meal]}`} title={`${mealLabels[meal]} today`} action={<button onClick={() => navigate('mess')}>Rate meal</button>}>
          <div className="menu-pills">
            {dayMenu.meals[meal].map(dish => <span key={dish}><UtensilsCrossed />{dish}</span>)}
          </div>
          <p className="muted small">Next: {mealLabels[mealOrder[(mealOrder.indexOf(meal) + 1) % 4]]}</p>
        </Panel>

        <Panel eyebrow="SUPPORT" title={user.role === 'admin' ? 'Complaints needing action' : 'Your active complaints'} action={<button onClick={() => navigate(user.role === 'admin' ? 'admin' : 'complaints')}>Open</button>}>
          {activeComplaints.length ? activeComplaints.slice(0, 3).map(item => (
            <div className="list-row compact" key={item.id}>
              <div className="list-main"><strong>{item.title}</strong><span>{item.ticket} · updated {timeAgo(item.updatedAt)}</span></div>
              <StatusBadge status={item.status} />
            </div>
          )) : <EmptyState icon={<CircleAlert />} title={data.loading ? 'Loading…' : 'Nothing pending'} message="All your requests are resolved." />}
        </Panel>
      </div>
    </>
  )
}
