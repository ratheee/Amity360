import { useState } from 'react'
import { ChevronRight, CircleAlert, Send } from 'lucide-react'
import type { Complaint, ComplaintCategory, ComplaintStatus, Priority } from '../types'
import { complaintCategoryLabels, priorityLabels } from '../data/labels'
import { useCurrentUser } from '../context/auth'
import { useToast } from '../context/ToastContext'
import { useAsync } from '../hooks/useAsync'
import { useForm } from '../hooks/useForm'
import { api } from '../services/api'
import { AsyncContent, Button, EmptyState, Field, PageHeader, Panel, PriorityBadge, StatusBadge, Tabs } from '../components/ui'
import { ComplaintDetailModal } from '../components/ComplaintDetailModal'
import { timeAgo } from '../utils/format'
import { maxLength, minLength, required } from '../utils/validation'

type Filter = ComplaintStatus | 'all'

export function ComplaintsPage() {
  const user = useCurrentUser()
  const complaints = useAsync(() => api.complaints.list(user), [user.id])
  const [filter, setFilter] = useState<Filter>('all')
  const [selected, setSelected] = useState<Complaint | null>(null)

  const items = complaints.data ?? []
  const count = (status: ComplaintStatus) => items.filter(item => item.status === status).length

  return (
    <>
      <PageHeader module="complaints" subtitle="Report hostel, academic, IT or infrastructure issues and follow them to resolution." />
      <div className="two-col wide-right">
        <ComplaintForm onCreated={complaints.reload} />
        <Panel eyebrow="TRACKING" title={user.role === 'admin' ? 'All complaints' : 'Your complaints'}>
          <Tabs
            tabs={[
              { key: 'all' as Filter, label: 'All', count: items.length },
              { key: 'open' as Filter, label: 'Open', count: count('open') },
              { key: 'in_progress' as Filter, label: 'In progress', count: count('in_progress') },
              { key: 'resolved' as Filter, label: 'Resolved', count: count('resolved') },
            ]}
            active={filter}
            onChange={setFilter}
          />
          <AsyncContent state={complaints}>
            {data => {
              const shown = filter === 'all' ? data : data.filter(item => item.status === filter)
              return shown.length ? (
                <div className="complaint-list">
                  {shown.map(item => (
                    <button className="complaint-row" key={item.id} onClick={() => setSelected(item)}>
                      <div className="list-main">
                        <span className="ticket">{item.ticket} · {complaintCategoryLabels[item.category]}</span>
                        <strong>{item.title}</strong>
                        <span>{item.location} · updated {timeAgo(item.updatedAt)}</span>
                      </div>
                      <div className="complaint-badges"><StatusBadge status={item.status} /><PriorityBadge priority={item.priority} /></div>
                      <ChevronRight className="arrow" />
                    </button>
                  ))}
                </div>
              ) : <EmptyState icon={<CircleAlert />} title="No complaints here" message={filter === 'all' ? 'Submit the form to raise your first request.' : 'Nothing with this status.'} />
            }}
          </AsyncContent>
        </Panel>
      </div>
      {selected && (
        <ComplaintDetailModal
          complaint={selected}
          onClose={() => setSelected(null)}
          onUpdated={updated => { setSelected(updated); complaints.reload() }}
        />
      )}
    </>
  )
}

function ComplaintForm({ onCreated }: { onCreated: () => void }) {
  const user = useCurrentUser()
  const toast = useToast()
  const initial = { title: '', category: '', location: '', priority: 'medium', description: '' }
  const form = useForm(initial, {
    title: [required('Title'), minLength(5, 'Title'), maxLength(80, 'Title')],
    category: [required('Category')],
    location: [required('Location'), maxLength(100, 'Location')],
    description: [required('Description'), minLength(20, 'Description'), maxLength(1000, 'Description')],
  })

  const submit = form.handleSubmit(async values => {
    const complaint = await api.complaints.create(user, {
      ...values,
      category: values.category as ComplaintCategory,
      priority: values.priority as Priority,
    })
    toast.success(`Complaint ${complaint.ticket} submitted`)
    form.reset()
    onCreated()
  })

  return (
    <Panel eyebrow="NEW REQUEST" title="Raise a complaint">
      <form className="form-stack" onSubmit={submit} noValidate>
        <Field label="Title" htmlFor="title" error={form.errors.title} required>
          <input className="input" placeholder="Short summary of the issue" {...form.bind('title')} />
        </Field>
        <div className="form-row">
          <Field label="Category" htmlFor="category" error={form.errors.category} required>
            <select className="input" {...form.bind('category')}>
              <option value="">Select…</option>
              {Object.entries(complaintCategoryLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
            </select>
          </Field>
          <Field label="Priority" htmlFor="priority">
            <select className="input" {...form.bind('priority')}>
              {Object.entries(priorityLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
            </select>
          </Field>
        </div>
        <Field label="Location" htmlFor="location" error={form.errors.location} required>
          <input className="input" placeholder="e.g. Boys Hostel, Block B, Room 214" {...form.bind('location')} />
        </Field>
        <Field label="Description" htmlFor="description" error={form.errors.description} hint={`${form.values.description.length}/1000 · at least 20 characters`} required>
          <textarea className="input" rows={5} placeholder="Describe the problem, when it started and anything already tried." {...form.bind('description')} />
        </Field>
        <Button type="submit" loading={form.submitting} icon={<Send />}>Submit complaint</Button>
      </form>
    </Panel>
  )
}
