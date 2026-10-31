import type { ReactNode } from 'react'
import { CircleAlert, Inbox, LoaderCircle } from 'lucide-react'
import { Button } from './Button'

export function Spinner({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="state-box" role="status">
      <LoaderCircle className="spin" />
      <span>{label}</span>
    </div>
  )
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="state-box error">
      <CircleAlert />
      <span>{message}</span>
      {onRetry && <Button variant="secondary" size="sm" onClick={onRetry}>Try again</Button>}
    </div>
  )
}

export function EmptyState({ icon, title, message, action }: { icon?: ReactNode; title: string; message?: string; action?: ReactNode }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon ?? <Inbox />}</div>
      <strong>{title}</strong>
      {message && <p>{message}</p>}
      {action}
    </div>
  )
}

/** Renders loading / error states for a `useAsync` result, and children once data is available. */
export function AsyncContent<T>({ state, children }: { state: { data: T | null; loading: boolean; error: string | null; reload: () => void }; children: (data: T) => ReactNode }) {
  if (state.error) return <ErrorState message={state.error} onRetry={state.reload} />
  if (state.data === null) return <Spinner />
  return <>{children(state.data)}</>
}
