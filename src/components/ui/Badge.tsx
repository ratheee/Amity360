import type { ReactNode } from 'react'
import type { ComplaintStatus, Priority } from '../../types'
import { complaintStatusLabels, priorityLabels } from '../../data/labels'

export type BadgeTone = 'blue' | 'gold' | 'green' | 'red' | 'purple' | 'gray' | 'teal'

export function Badge({ tone = 'gray', children }: { tone?: BadgeTone; children: ReactNode }) {
  return <span className={`badge badge-${tone}`}>{children}</span>
}

const statusTones: Record<ComplaintStatus, BadgeTone> = { open: 'blue', in_progress: 'gold', resolved: 'green', rejected: 'red' }
const priorityTones: Record<Priority, BadgeTone> = { low: 'gray', medium: 'purple', high: 'red' }

export const StatusBadge = ({ status }: { status: ComplaintStatus }) => <Badge tone={statusTones[status]}>{complaintStatusLabels[status]}</Badge>
export const PriorityBadge = ({ priority }: { priority: Priority }) => <Badge tone={priorityTones[priority]}>{priorityLabels[priority]} priority</Badge>
