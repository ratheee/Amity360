import { useState } from 'react'
import type { Complaint, ComplaintStatus } from '../types'
import { complaintCategoryLabels, complaintStatusLabels } from '../data/labels'
import { useCurrentUser } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { api } from '../services/api'
import { Button, Field, Modal, PriorityBadge, StatusBadge } from './ui'
import { formatDateTime } from '../utils/format'

const statuses: ComplaintStatus[] = ['open', 'in_progress', 'resolved', 'rejected']

/** Complaint details with status timeline. Admins also get a form to update the status. */
export function ComplaintDetailModal({ complaint, onClose, onUpdated }: { complaint: Complaint; onClose: () => void; onUpdated: (complaint: Complaint) => void }) {
  const user = useCurrentUser()
  const toast = useToast()
  const [status, setStatus] = useState<ComplaintStatus>(complaint.status)
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const save = async () => {
    if (status === complaint.status && !note.trim()) return setError('Change the status or add a note.')
    if ((status === 'resolved' || status === 'rejected') && !note.trim()) return setError('Add a note explaining the resolution.')
    if (note.length > 300) return setError('Note must be at most 300 characters.')
    setError('')
    setSaving(true)
    try {
      const updated = await api.complaints.updateStatus(user, complaint.id, status, note)
      toast.success(`${complaint.ticket} updated – student notified`)
      setNote('')
      onUpdated(updated)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not update complaint')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open wide title={complaint.title} subtitle={`${complaint.ticket} · raised by ${complaint.userName}`} onClose={onClose}>
      <div className="detail-badges">
        <StatusBadge status={complaint.status} />
        <PriorityBadge priority={complaint.priority} />
      </div>
      <dl className="detail-grid">
        <div><dt>Category</dt><dd>{complaintCategoryLabels[complaint.category]}</dd></div>
        <div><dt>Location</dt><dd>{complaint.location}</dd></div>
        <div><dt>Raised</dt><dd>{formatDateTime(complaint.createdAt)}</dd></div>
        <div><dt>Last update</dt><dd>{formatDateTime(complaint.updatedAt)}</dd></div>
      </dl>
      <p className="detail-body">{complaint.description}</p>

      <h3 className="section-title">Timeline</h3>
      <ol className="timeline">
        {complaint.history.map((entry, index) => (
          <li key={index} className={`tl-${entry.status}`}>
            <div className="tl-dot" />
            <div>
              <strong>{complaintStatusLabels[entry.status]}</strong>
              <p>{entry.note}</p>
              <small>{entry.by} · {formatDateTime(entry.at)}</small>
            </div>
          </li>
        ))}
      </ol>

      {user.role === 'admin' && (
        <div className="admin-update">
          <h3 className="section-title">Update status</h3>
          <div className="segmented">
            {statuses.map(item => <button type="button" key={item} className={status === item ? 'active' : ''} onClick={() => setStatus(item)}>{complaintStatusLabels[item]}</button>)}
          </div>
          <Field label="Note for the student" htmlFor="status-note" error={error} hint={`${note.length}/300`}>
            <textarea id="status-note" className="input" rows={2} value={note} onChange={event => setNote(event.target.value)} placeholder="e.g. Electrician scheduled for tomorrow morning" />
          </Field>
          <Button onClick={save} loading={saving}>Save update</Button>
        </div>
      )}
    </Modal>
  )
}
