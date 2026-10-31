import { useState } from 'react'
import { CalendarDays, CircleAlert, LibraryBig, Search, Star, Users } from 'lucide-react'
import type { Complaint, ComplaintCategory, ComplaintStatus, ModuleKey, Role, User } from '../../types'
import { complaintCategoryLabels, complaintStatusLabels, mealLabels, mealOrder, roleLabels } from '../../data/labels'
import { useCurrentUser } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { useAsync } from '../../hooks/useAsync'
import { api } from '../../services/api'
import { AsyncContent, EmptyState, PageHeader, Panel, PriorityBadge, StatCard, StatusBadge, Tabs } from '../../components/ui'
import { ComplaintDetailModal } from '../../components/ComplaintDetailModal'
import { formatDate, initials, timeAgo } from '../../utils/format'

type Tab = 'overview' | 'complaints' | 'users'

export function AdminPage({ navigate }: { navigate: (key: ModuleKey) => void }) {
  const user = useCurrentUser()
  const [tab, setTab] = useState<Tab>('overview')
  const stats = useAsync(() => api.stats.admin(user), [user.id])
  const complaints = useAsync(() => api.complaints.list(user), [user.id])
  const [selected, setSelected] = useState<Complaint | null>(null)

  const refresh = () => {
    stats.reload()
    complaints.reload()
  }

  return (
    <>
      <PageHeader module="admin" subtitle="Monitor campus services, resolve complaints and manage user accounts." />
      <Tabs tabs={[{ key: 'overview' as Tab, label: 'Overview' }, { key: 'complaints' as Tab, label: 'Complaints', count: complaints.data?.length }, { key: 'users' as Tab, label: 'Users' }]} active={tab} onChange={setTab} />

      {tab === 'overview' && (
        <AsyncContent state={stats}>
          {data => {
            const totalUsers = data.users.student + data.users.faculty + data.users.admin
            const totalComplaints = Object.values(data.complaints).reduce((a, b) => a + b, 0)
            return (
              <>
                <div className="stat-grid four">
                  <StatCard label="Registered users" value={totalUsers} detail={`${data.users.student} students · ${data.users.faculty} faculty`} icon={<Users />} tone={0} />
                  <StatCard label="Open complaints" value={data.complaints.open + data.complaints.in_progress} detail={`${data.complaints.open} new · ${data.complaints.in_progress} in progress`} icon={<CircleAlert />} tone={3} />
                  <StatCard label="Mess rating" value={data.messAverage ? `${data.messAverage.toFixed(1)} / 5` : '—'} detail="Average across all reviews" icon={<Star />} tone={1} />
                  <StatCard label="Upcoming events" value={data.upcomingEvents} detail={`${data.resources} resources · ${data.assignments} assignments`} icon={<CalendarDays />} tone={4} />
                </div>
                <div className="two-col">
                  <Panel eyebrow="SUPPORT" title="Complaints by status">
                    <div className="bar-list">
                      {(Object.keys(data.complaints) as ComplaintStatus[]).map(status => (
                        <div className="bar-row" key={status}>
                          <span>{complaintStatusLabels[status]}</span>
                          <div className={`bar bar-${status}`}><span style={{ width: `${totalComplaints ? (data.complaints[status] / totalComplaints) * 100 : 0}%` }} /></div>
                          <strong>{data.complaints[status]}</strong>
                        </div>
                      ))}
                    </div>
                  </Panel>
                  <Panel eyebrow="DINING" title="Mess ratings by meal" action={<button onClick={() => navigate('mess')}>View reviews</button>}>
                    <div className="bar-list">
                      {mealOrder.map(meal => (
                        <div className="bar-row" key={meal}>
                          <span>{mealLabels[meal]}</span>
                          <div className="bar bar-gold"><span style={{ width: `${(data.messByMeal[meal].average / 5) * 100}%` }} /></div>
                          <strong>{data.messByMeal[meal].count ? data.messByMeal[meal].average.toFixed(1) : '—'}</strong>
                        </div>
                      ))}
                    </div>
                  </Panel>
                </div>
                <Panel eyebrow="RECENT" title="Latest complaints" action={<button onClick={() => setTab('complaints')}>Manage all</button>}>
                  {complaints.data?.slice(0, 4).map(item => (
                    <button className="complaint-row" key={item.id} onClick={() => setSelected(item)}>
                      <div className="list-main"><span className="ticket">{item.ticket}</span><strong>{item.title}</strong><span>{item.userName} · {timeAgo(item.createdAt)}</span></div>
                      <div className="complaint-badges"><StatusBadge status={item.status} /></div>
                    </button>
                  ))}
                </Panel>
                <div className="quick-links">
                  <button onClick={() => navigate('updates')}><CalendarDays /> Post an announcement</button>
                  <button onClick={() => navigate('resources')}><LibraryBig /> Manage academic resources</button>
                </div>
              </>
            )
          }}
        </AsyncContent>
      )}

      {tab === 'complaints' && <AsyncContent state={complaints}>{data => <ComplaintTable items={data} onSelect={setSelected} />}</AsyncContent>}
      {tab === 'users' && <UserTable />}

      {selected && <ComplaintDetailModal complaint={selected} onClose={() => setSelected(null)} onUpdated={updated => { setSelected(updated); refresh() }} />}
    </>
  )
}

function ComplaintTable({ items, onSelect }: { items: Complaint[]; onSelect: (item: Complaint) => void }) {
  const [status, setStatus] = useState<ComplaintStatus | ''>('')
  const [category, setCategory] = useState<ComplaintCategory | ''>('')
  const [term, setTerm] = useState('')
  const q = term.trim().toLowerCase()
  const shown = items.filter(item =>
    (!status || item.status === status) && (!category || item.category === category) && `${item.ticket} ${item.title} ${item.userName}`.toLowerCase().includes(q))

  return (
    <Panel>
      <div className="filter-bar">
        <div className="search small-search"><Search /><input placeholder="Search ticket, title or student…" value={term} onChange={event => setTerm(event.target.value)} aria-label="Search complaints" /></div>
        <select className="input" value={status} onChange={event => setStatus(event.target.value as ComplaintStatus | '')} aria-label="Filter by status">
          <option value="">All statuses</option>
          {Object.entries(complaintStatusLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
        </select>
        <select className="input" value={category} onChange={event => setCategory(event.target.value as ComplaintCategory | '')} aria-label="Filter by category">
          <option value="">All categories</option>
          {Object.entries(complaintCategoryLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
        </select>
      </div>
      {shown.length ? (
        <div className="table-wrap">
          <table className="table clickable">
            <thead><tr><th>Ticket</th><th>Issue</th><th>Raised by</th><th>Category</th><th>Priority</th><th>Status</th><th>Updated</th></tr></thead>
            <tbody>
              {shown.map(item => (
                <tr key={item.id} onClick={() => onSelect(item)} tabIndex={0} onKeyDown={event => event.key === 'Enter' && onSelect(item)}>
                  <td className="mono">{item.ticket}</td>
                  <td><strong>{item.title}</strong><small className="cell-note">{item.location}</small></td>
                  <td>{item.userName}</td>
                  <td>{complaintCategoryLabels[item.category]}</td>
                  <td><PriorityBadge priority={item.priority} /></td>
                  <td><StatusBadge status={item.status} /></td>
                  <td>{timeAgo(item.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <EmptyState icon={<CircleAlert />} title="No complaints match these filters" />}
    </Panel>
  )
}

function UserTable() {
  const admin = useCurrentUser()
  const toast = useToast()
  const users = useAsync(() => api.users.list(admin), [admin.id])
  const [roleFilter, setRoleFilter] = useState<Role | ''>('')
  const [term, setTerm] = useState('')

  const changeRole = async (user: User, role: Role) => {
    try {
      await api.users.updateRole(admin, user.id, role)
      toast.success(`${user.name} is now ${roleLabels[role]}`)
      users.reload()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not change role')
    }
  }

  return (
    <Panel>
      <div className="filter-bar">
        <div className="search small-search"><Search /><input placeholder="Search by name or email…" value={term} onChange={event => setTerm(event.target.value)} aria-label="Search users" /></div>
        <select className="input" value={roleFilter} onChange={event => setRoleFilter(event.target.value as Role | '')} aria-label="Filter by role">
          <option value="">All roles</option>
          {Object.entries(roleLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
        </select>
      </div>
      <AsyncContent state={users}>
        {data => {
          const q = term.trim().toLowerCase()
          const shown = data.filter(user => (!roleFilter || user.role === roleFilter) && `${user.name} ${user.email}`.toLowerCase().includes(q))
          return (
            <div className="table-wrap">
              <table className="table">
                <thead><tr><th>User</th><th>Details</th><th>Joined</th><th>Role</th></tr></thead>
                <tbody>
                  {shown.map(user => (
                    <tr key={user.id}>
                      <td><div className="user-cell"><div className="avatar small">{initials(user.name)}</div><div><strong>{user.name}</strong><small className="cell-note">{user.email}</small></div></div></td>
                      <td>{user.role === 'student' ? `${user.enrollmentNo ?? ''} · ${user.program ?? ''}${user.semester ? ` · Sem ${user.semester}` : ''}` : user.department ?? '—'}</td>
                      <td>{formatDate(user.createdAt)}</td>
                      <td>
                        <select className="input role-select" value={user.role} disabled={user.id === admin.id} onChange={event => changeRole(user, event.target.value as Role)} aria-label={`Role for ${user.name}`}>
                          {Object.entries(roleLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        }}
      </AsyncContent>
    </Panel>
  )
}
