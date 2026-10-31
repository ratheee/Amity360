import { useState } from 'react'
import { CalendarDays, Check, MapPin, Megaphone, Pin, Plus, Trash2 } from 'lucide-react'
import type { Announcement, AnnouncementCategory } from '../types'
import { announcementCategoryLabels } from '../data/labels'
import { useCurrentUser } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useAsync } from '../hooks/useAsync'
import { useForm } from '../hooks/useForm'
import { api } from '../services/api'
import { AsyncContent, Badge, Button, Chips, EmptyState, Field, Modal, PageHeader, Tabs, type BadgeTone } from '../components/ui'
import { formatDate, timeAgo } from '../utils/format'
import { maxLength, minLength, notInPast, required, type Validator } from '../utils/validation'

const categoryTones: Record<AnnouncementCategory, BadgeTone> = { academic: 'blue', event: 'gold', campus: 'green', sports: 'teal', placement: 'purple' }
const categories = Object.keys(announcementCategoryLabels) as AnnouncementCategory[]

export function AnnouncementsPage() {
  const user = useCurrentUser()
  const toast = useToast()
  const state = useAsync(() => api.announcements.list())
  const [tab, setTab] = useState<'all' | 'events'>('all')
  const [category, setCategory] = useState<AnnouncementCategory | 'all'>('all')
  const [creating, setCreating] = useState(false)
  const [busy, setBusy] = useState<string | null>(null)
  const canPost = user.role !== 'student'

  const act = async (id: string, action: () => Promise<unknown>, success?: string) => {
    setBusy(id)
    try {
      await action()
      if (success) toast.success(success)
      state.reload()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setBusy(null)
    }
  }

  const upcoming = (item: Announcement) => item.event && new Date(item.event.date) >= new Date(new Date().toDateString())

  return (
    <>
      <PageHeader module="updates" subtitle="Official notices, campus news and upcoming events." actions={canPost && <Button icon={<Plus />} onClick={() => setCreating(true)}>Post update</Button>} />
      <Tabs
        tabs={[
          { key: 'all' as const, label: 'All updates', count: state.data?.length },
          { key: 'events' as const, label: 'Upcoming events', count: state.data?.filter(upcoming).length },
        ]}
        active={tab}
        onChange={setTab}
      />
      {tab === 'all' && <Chips options={[{ key: 'all' as const, label: 'All' }, ...categories.map(key => ({ key, label: announcementCategoryLabels[key] }))]} active={category} onChange={setCategory} />}

      <AsyncContent state={state}>
        {data => {
          const shown = tab === 'events'
            ? data.filter(upcoming).sort((a, b) => a.event!.date.localeCompare(b.event!.date))
            : data.filter(item => category === 'all' || item.category === category)
          if (!shown.length) return <EmptyState icon={<Megaphone />} title={tab === 'events' ? 'No upcoming events' : 'No announcements'} />
          return (
            <div className="announcement-list">
              {shown.map(item => {
                const going = item.event?.rsvps.includes(user.id)
                const canDelete = user.role === 'admin' || item.createdBy === user.id
                return (
                  <article className={`announcement-card ${item.pinned ? 'pinned' : ''}`} key={item.id}>
                    {item.event && (
                      <div className="event-date">
                        <strong>{new Date(item.event.date).getDate()}</strong>
                        <span>{formatDate(item.event.date, { month: 'short' })}</span>
                      </div>
                    )}
                    <div className="announcement-body">
                      <div className="announcement-meta">
                        <Badge tone={categoryTones[item.category]}>{announcementCategoryLabels[item.category]}</Badge>
                        {item.pinned && <span className="pinned-tag"><Pin size={12} /> Pinned</span>}
                        <small>{item.createdByName} · {timeAgo(item.createdAt)}</small>
                      </div>
                      <h3>{item.title}</h3>
                      <p>{item.body}</p>
                      {item.event && (
                        <div className="event-info">
                          <span><CalendarDays size={14} /> {formatDate(item.event.date, { weekday: 'short', day: 'numeric', month: 'short' })}, {item.event.time}</span>
                          <span><MapPin size={14} /> {item.event.venue}</span>
                          <span>{item.event.rsvps.length} going</span>
                        </div>
                      )}
                    </div>
                    <div className="announcement-actions">
                      {item.event && upcoming(item) && (
                        <Button size="sm" variant={going ? 'secondary' : 'primary'} icon={going ? <Check /> : undefined} loading={busy === item.id}
                          onClick={() => act(item.id, () => api.announcements.toggleRsvp(user, item.id), going ? 'RSVP cancelled' : 'You’re going! See you there.')}>
                          {going ? 'Going' : 'RSVP'}
                        </Button>
                      )}
                      {canDelete && (
                        <Button size="sm" variant="ghost" icon={<Trash2 />} aria-label="Delete announcement"
                          onClick={() => act(item.id, () => api.announcements.remove(user, item.id), 'Announcement deleted')} />
                      )}
                    </div>
                  </article>
                )
              })}
            </div>
          )
        }}
      </AsyncContent>

      {creating && <AnnouncementModal onClose={() => setCreating(false)} onCreated={state.reload} />}
    </>
  )
}

function AnnouncementModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const user = useCurrentUser()
  const toast = useToast()
  const [isEvent, setIsEvent] = useState(false)
  const whenEvent = (rule: Validator): Validator => (value, values) => (isEvent ? rule(value, values) : undefined)

  const form = useForm({ title: '', body: '', category: 'academic', pinned: '', date: '', time: '', venue: '' }, {
    title: [required('Title'), minLength(5, 'Title'), maxLength(120, 'Title')],
    body: [required('Details'), minLength(10, 'Details'), maxLength(2000, 'Details')],
    date: [whenEvent(required('Event date')), whenEvent(notInPast)],
    time: [whenEvent(required('Event time'))],
    venue: [whenEvent(required('Venue')), maxLength(100, 'Venue')],
  })

  const submit = form.handleSubmit(async values => {
    const time = values.time && new Date(`2000-01-01T${values.time}`).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })
    await api.announcements.create(user, {
      title: values.title,
      body: values.body,
      category: values.category as AnnouncementCategory,
      pinned: values.pinned === 'yes',
      event: isEvent ? { date: new Date(`${values.date}T${values.time}`).toISOString(), time, venue: values.venue.trim() } : undefined,
    })
    toast.success(isEvent ? 'Event published' : 'Announcement published')
    onCreated()
    onClose()
  })

  return (
    <Modal open title="Post an update" subtitle="Everyone on Amity 360 will be notified." onClose={onClose}
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button onClick={submit} loading={form.submitting}>Publish</Button></>}>
      <form className="form-stack" onSubmit={submit} noValidate>
        <Field label="Title" htmlFor="title" error={form.errors.title} required><input className="input" {...form.bind('title')} /></Field>
        <Field label="Category" htmlFor="category">
          <select className="input" {...form.bind('category')}>{categories.map(key => <option key={key} value={key}>{announcementCategoryLabels[key]}</option>)}</select>
        </Field>
        <Field label="Details" htmlFor="body" error={form.errors.body} required><textarea className="input" rows={4} {...form.bind('body')} /></Field>
        <label className="checkbox"><input type="checkbox" checked={isEvent} onChange={event => setIsEvent(event.target.checked)} /> This is an event (enables RSVPs)</label>
        {isEvent && (
          <>
            <div className="form-row">
              <Field label="Date" htmlFor="date" error={form.errors.date} required><input className="input" type="date" {...form.bind('date')} /></Field>
              <Field label="Time" htmlFor="time" error={form.errors.time} required><input className="input" type="time" {...form.bind('time')} /></Field>
            </div>
            <Field label="Venue" htmlFor="venue" error={form.errors.venue} required><input className="input" placeholder="e.g. Main Auditorium" {...form.bind('venue')} /></Field>
          </>
        )}
        {user.role === 'admin' && (
          <label className="checkbox"><input type="checkbox" checked={form.values.pinned === 'yes'} onChange={event => form.setField('pinned', event.target.checked ? 'yes' : '')} /> Pin to the top</label>
        )}
      </form>
    </Modal>
  )
}
