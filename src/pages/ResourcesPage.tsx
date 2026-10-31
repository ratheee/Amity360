import { useState } from 'react'
import { BookOpen, CalendarClock, ExternalLink, FileText, Plus, Presentation, ScrollText, Search, Send, Trash2, Users, Video } from 'lucide-react'
import type { Assignment, Resource, ResourceType } from '../types'
import { resourceTypeLabels, subjects } from '../data/labels'
import { useCurrentUser } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useAsync } from '../hooks/useAsync'
import { useForm } from '../hooks/useForm'
import { api, resourceTypes } from '../services/api'
import { AsyncContent, Badge, Button, Chips, EmptyState, Field, Modal, PageHeader, Tabs } from '../components/ui'
import { daysUntil, formatDate, formatDateTime } from '../utils/format'
import { maxLength, minLength, notInPast, numberRange, required, url } from '../utils/validation'

const typeIcons: Record<ResourceType, typeof FileText> = { notes: FileText, slides: Presentation, paper: ScrollText, book: BookOpen, video: Video }

export function ResourcesPage() {
  const user = useCurrentUser()
  const [tab, setTab] = useState<'materials' | 'assignments'>('materials')
  const resources = useAsync(() => api.resources.list())
  const assignments = useAsync(() => api.assignments.list())
  const canManage = user.role !== 'student'

  return (
    <>
      <PageHeader module="resources" subtitle={canManage ? 'Share study material, set assignments and grade submissions.' : 'Study material from your faculty and your assignment deadlines.'} />
      <Tabs
        tabs={[
          { key: 'materials' as const, label: 'Study material', count: resources.data?.length },
          { key: 'assignments' as const, label: 'Assignments', count: assignments.data?.length },
        ]}
        active={tab}
        onChange={setTab}
      />
      {tab === 'materials'
        ? <AsyncContent state={resources}>{data => <Materials items={data} canManage={canManage} reload={resources.reload} />}</AsyncContent>
        : <AsyncContent state={assignments}>{data => <Assignments items={data} canManage={canManage} reload={assignments.reload} />}</AsyncContent>}
    </>
  )
}

function Materials({ items, canManage, reload }: { items: Resource[]; canManage: boolean; reload: () => void }) {
  const user = useCurrentUser()
  const toast = useToast()
  const [term, setTerm] = useState('')
  const [subject, setSubject] = useState('')
  const [type, setType] = useState<ResourceType | 'all'>('all')
  const [creating, setCreating] = useState(false)

  const q = term.trim().toLowerCase()
  const shown = items.filter(item =>
    (!subject || item.subject === subject) && (type === 'all' || item.type === type) && `${item.title} ${item.description}`.toLowerCase().includes(q))

  const remove = async (item: Resource) => {
    try {
      await api.resources.remove(user, item.id)
      toast.success('Resource removed')
      reload()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not remove resource')
    }
  }

  return (
    <>
      <div className="filter-bar">
        <div className="search small-search"><Search /><input placeholder="Search notes, papers, slides…" value={term} onChange={event => setTerm(event.target.value)} aria-label="Search resources" /></div>
        <select className="input" value={subject} onChange={event => setSubject(event.target.value)} aria-label="Filter by subject">
          <option value="">All subjects</option>
          {subjects.map(item => <option key={item}>{item}</option>)}
        </select>
        {canManage && <Button icon={<Plus />} onClick={() => setCreating(true)}>Add resource</Button>}
      </div>
      <Chips options={[{ key: 'all' as const, label: 'All types' }, ...resourceTypes.map(key => ({ key, label: resourceTypeLabels[key] }))]} active={type} onChange={setType} />

      {shown.length ? (
        <div className="card-grid">
          {shown.map(item => {
            const Icon = typeIcons[item.type]
            return (
              <article className="resource-card" key={item.id}>
                <div className="resource-top">
                  <div className={`quick-icon tone-${resourceTypes.indexOf(item.type)}`}><Icon /></div>
                  <Badge tone="gray">Sem {item.semester}</Badge>
                </div>
                <strong>{item.title}</strong>
                <p>{item.description}</p>
                <span className="resource-meta">{item.subject}</span>
                <span className="resource-meta">{resourceTypeLabels[item.type]} · {item.uploadedBy} · {formatDate(item.createdAt)}</span>
                <div className="card-actions">
                  <a className="btn btn-secondary btn-sm" href={item.url} target="_blank" rel="noreferrer"><ExternalLink /><span>Open</span></a>
                  {canManage && <Button variant="ghost" size="sm" icon={<Trash2 />} onClick={() => remove(item)} aria-label={`Remove ${item.title}`} />}
                </div>
              </article>
            )
          })}
        </div>
      ) : <EmptyState icon={<BookOpen />} title="No resources found" message="Try a different search or filter." />}

      {creating && <ResourceModal onClose={() => setCreating(false)} onCreated={reload} />}
    </>
  )
}

function ResourceModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const user = useCurrentUser()
  const toast = useToast()
  const form = useForm({ title: '', description: '', subject: '', semester: '', type: 'notes', url: '' }, {
    title: [required('Title'), minLength(4, 'Title'), maxLength(100, 'Title')],
    description: [maxLength(300, 'Description')],
    subject: [required('Subject')],
    semester: [required('Semester')],
    url: [required('Link'), url],
  })

  const submit = form.handleSubmit(async values => {
    await api.resources.create(user, { ...values, semester: Number(values.semester), type: values.type as ResourceType })
    toast.success('Resource published')
    onCreated()
    onClose()
  })

  return (
    <Modal open title="Add study material" subtitle="Students will see this under Study material." onClose={onClose}
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button onClick={submit} loading={form.submitting}>Publish</Button></>}>
      <form className="form-stack" onSubmit={submit} noValidate>
        <Field label="Title" htmlFor="title" error={form.errors.title} required><input className="input" {...form.bind('title')} /></Field>
        <Field label="Description" htmlFor="description" error={form.errors.description}><textarea className="input" rows={2} {...form.bind('description')} /></Field>
        <div className="form-row">
          <Field label="Subject" htmlFor="subject" error={form.errors.subject} required>
            <select className="input" {...form.bind('subject')}><option value="">Select…</option>{subjects.map(item => <option key={item}>{item}</option>)}</select>
          </Field>
          <Field label="Semester" htmlFor="semester" error={form.errors.semester} required>
            <select className="input" {...form.bind('semester')}><option value="">Select…</option>{Array.from({ length: 10 }, (_, i) => <option key={i} value={i + 1}>Semester {i + 1}</option>)}</select>
          </Field>
        </div>
        <Field label="Type" htmlFor="type">
          <select className="input" {...form.bind('type')}>{resourceTypes.map(item => <option key={item} value={item}>{resourceTypeLabels[item]}</option>)}</select>
        </Field>
        <Field label="Link" htmlFor="url" error={form.errors.url} hint="Google Drive, OneDrive or any public link. File uploads arrive with the backend." required>
          <input className="input" type="url" placeholder="https://" {...form.bind('url')} />
        </Field>
      </form>
    </Modal>
  )
}

function Assignments({ items, canManage, reload }: { items: Assignment[]; canManage: boolean; reload: () => void }) {
  const user = useCurrentUser()
  const toast = useToast()
  const [creating, setCreating] = useState(false)
  const [submitting, setSubmitting] = useState<Assignment | null>(null)
  const [reviewing, setReviewing] = useState<Assignment | null>(null)

  const remove = async (item: Assignment) => {
    try {
      await api.assignments.remove(user, item.id)
      toast.success('Assignment deleted')
      reload()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not delete assignment')
    }
  }

  return (
    <>
      {canManage && <div className="filter-bar end"><Button icon={<Plus />} onClick={() => setCreating(true)}>New assignment</Button></div>}
      {items.length ? (
        <div className="assignment-list">
          {items.map(item => {
            const days = daysUntil(item.dueDate)
            const overdue = new Date(item.dueDate) < new Date()
            const mine = item.submissions.find(sub => sub.userId === user.id)
            return (
              <article className="assignment" key={item.id}>
                <div className="date-chip large"><strong>{new Date(item.dueDate).getDate()}</strong><span>{formatDate(item.dueDate, { month: 'short' })}</span></div>
                <div className="assignment-main">
                  <div className="assignment-title">
                    <strong>{item.title}</strong>
                    {overdue ? <Badge tone="gray">Closed</Badge> : <Badge tone={days <= 1 ? 'red' : 'gold'}>{days === 0 ? 'Due today' : `Due in ${days} day${days === 1 ? '' : 's'}`}</Badge>}
                  </div>
                  <span className="resource-meta">{item.subject} · {item.maxMarks} marks · by {item.createdByName}</span>
                  <p>{item.description}</p>
                  <span className="meta-line"><CalendarClock size={14} /> Due {formatDateTime(item.dueDate)}</span>
                </div>
                <div className="assignment-actions">
                  {canManage ? (
                    <>
                      <Button variant="secondary" size="sm" icon={<Users />} onClick={() => setReviewing(item)}>{item.submissions.length} submission{item.submissions.length === 1 ? '' : 's'}</Button>
                      <Button variant="ghost" size="sm" icon={<Trash2 />} onClick={() => remove(item)} aria-label="Delete assignment" />
                    </>
                  ) : mine ? (
                    <>
                      {mine.marks !== undefined ? <Badge tone="green">Graded {mine.marks}/{item.maxMarks}</Badge> : <Badge tone="blue">Submitted</Badge>}
                      {!overdue && mine.marks === undefined && <Button variant="ghost" size="sm" onClick={() => setSubmitting(item)}>Resubmit</Button>}
                    </>
                  ) : overdue ? <Badge tone="red">Missed</Badge> : <Button size="sm" icon={<Send />} onClick={() => setSubmitting(item)}>Submit</Button>}
                </div>
              </article>
            )
          })}
        </div>
      ) : <EmptyState icon={<CalendarClock />} title="No assignments yet" />}

      {creating && <AssignmentModal onClose={() => setCreating(false)} onCreated={reload} />}
      {submitting && <SubmitModal assignment={submitting} onClose={() => setSubmitting(null)} onSubmitted={reload} />}
      {reviewing && <SubmissionsModal assignment={reviewing} onClose={() => setReviewing(null)} onGraded={reload} />}
    </>
  )
}

function AssignmentModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const user = useCurrentUser()
  const toast = useToast()
  const form = useForm({ title: '', subject: '', description: '', dueDate: '', dueTime: '23:59', maxMarks: '10' }, {
    title: [required('Title'), minLength(4, 'Title'), maxLength(100, 'Title')],
    subject: [required('Subject')],
    description: [required('Instructions'), minLength(10, 'Instructions'), maxLength(1000, 'Instructions')],
    dueDate: [required('Due date'), notInPast],
    maxMarks: [required('Maximum marks'), numberRange(1, 100, 'Maximum marks')],
  })

  const submit = form.handleSubmit(async ({ dueDate, dueTime, maxMarks, ...rest }) => {
    await api.assignments.create(user, { ...rest, dueDate: new Date(`${dueDate}T${dueTime || '23:59'}`).toISOString(), maxMarks: Number(maxMarks) })
    toast.success('Assignment published and students notified')
    onCreated()
    onClose()
  })

  return (
    <Modal open title="New assignment" onClose={onClose}
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button onClick={submit} loading={form.submitting}>Publish</Button></>}>
      <form className="form-stack" onSubmit={submit} noValidate>
        <Field label="Title" htmlFor="title" error={form.errors.title} required><input className="input" {...form.bind('title')} /></Field>
        <Field label="Subject" htmlFor="subject" error={form.errors.subject} required>
          <select className="input" {...form.bind('subject')}><option value="">Select…</option>{subjects.map(item => <option key={item}>{item}</option>)}</select>
        </Field>
        <Field label="Instructions" htmlFor="description" error={form.errors.description} required><textarea className="input" rows={4} {...form.bind('description')} /></Field>
        <div className="form-row three">
          <Field label="Due date" htmlFor="dueDate" error={form.errors.dueDate} required><input className="input" type="date" {...form.bind('dueDate')} /></Field>
          <Field label="Time" htmlFor="dueTime"><input className="input" type="time" {...form.bind('dueTime')} /></Field>
          <Field label="Max marks" htmlFor="maxMarks" error={form.errors.maxMarks} required><input className="input" type="number" min={1} max={100} {...form.bind('maxMarks')} /></Field>
        </div>
      </form>
    </Modal>
  )
}

function SubmitModal({ assignment, onClose, onSubmitted }: { assignment: Assignment; onClose: () => void; onSubmitted: () => void }) {
  const user = useCurrentUser()
  const toast = useToast()
  const previous = assignment.submissions.find(sub => sub.userId === user.id)
  const form = useForm({ link: previous?.link ?? '', note: previous?.note ?? '' }, {
    link: [required('Submission link'), url],
    note: [maxLength(500, 'Note')],
  })

  const submit = form.handleSubmit(async values => {
    await api.assignments.submit(user, assignment.id, values.link, values.note)
    toast.success('Assignment submitted')
    onSubmitted()
    onClose()
  })

  return (
    <Modal open title={`Submit: ${assignment.title}`} subtitle={`Due ${formatDateTime(assignment.dueDate)}`} onClose={onClose}
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button onClick={submit} loading={form.submitting} icon={<Send />}>Submit</Button></>}>
      <form className="form-stack" onSubmit={submit} noValidate>
        <Field label="Submission link" htmlFor="link" error={form.errors.link} hint="Link to your file (Drive, GitHub, OneDrive…). Make sure it’s viewable." required>
          <input className="input" type="url" placeholder="https://" {...form.bind('link')} />
        </Field>
        <Field label="Note to faculty" htmlFor="note" error={form.errors.note}><textarea className="input" rows={3} {...form.bind('note')} /></Field>
      </form>
    </Modal>
  )
}

function SubmissionsModal({ assignment, onClose, onGraded }: { assignment: Assignment; onClose: () => void; onGraded: () => void }) {
  const user = useCurrentUser()
  const toast = useToast()
  const [marks, setMarks] = useState<Record<string, string>>(() => Object.fromEntries(assignment.submissions.map(sub => [sub.userId, sub.marks?.toString() ?? ''])))
  const [saving, setSaving] = useState<string | null>(null)

  const grade = async (userId: string) => {
    const value = Number(marks[userId])
    if (marks[userId] === '' || !Number.isFinite(value) || value < 0 || value > assignment.maxMarks) {
      return toast.error(`Enter marks between 0 and ${assignment.maxMarks}`)
    }
    setSaving(userId)
    try {
      await api.assignments.grade(user, assignment.id, userId, value)
      toast.success('Marks saved and student notified')
      onGraded()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not save marks')
    } finally {
      setSaving(null)
    }
  }

  return (
    <Modal open wide title="Submissions" subtitle={`${assignment.title} · out of ${assignment.maxMarks}`} onClose={onClose}>
      {assignment.submissions.length ? (
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Student</th><th>Submitted</th><th>Work</th><th>Marks</th><th /></tr></thead>
            <tbody>
              {assignment.submissions.map(sub => (
                <tr key={sub.userId}>
                  <td><strong>{sub.userName}</strong>{sub.note && <small className="cell-note">{sub.note}</small>}</td>
                  <td>{formatDateTime(sub.submittedAt)}</td>
                  <td><a href={sub.link} target="_blank" rel="noreferrer">Open <ExternalLink size={12} /></a></td>
                  <td><input className="input marks-input" type="number" min={0} max={assignment.maxMarks} value={marks[sub.userId]} onChange={event => setMarks(m => ({ ...m, [sub.userId]: event.target.value }))} aria-label={`Marks for ${sub.userName}`} /></td>
                  <td><Button size="sm" variant="secondary" loading={saving === sub.userId} onClick={() => grade(sub.userId)}>Save</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <EmptyState icon={<Users />} title="No submissions yet" />}
    </Modal>
  )
}
