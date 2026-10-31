import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { CheckCircle2, CircleAlert, Info, X } from 'lucide-react'

type ToastTone = 'success' | 'error' | 'info'
interface Toast {
  id: number
  tone: ToastTone
  message: string
}

interface ToastApi {
  success: (message: string) => void
  error: (message: string) => void
  info: (message: string) => void
}

const ToastContext = createContext<ToastApi | null>(null)
const icons = { success: CheckCircle2, error: CircleAlert, info: Info }
let nextId = 1

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const dismiss = useCallback((id: number) => setToasts(items => items.filter(item => item.id !== id)), [])

  const push = useCallback((tone: ToastTone, message: string) => {
    const id = nextId++
    setToasts(items => [...items.slice(-3), { id, tone, message }])
    setTimeout(() => dismiss(id), 4000)
  }, [dismiss])

  const value = useMemo<ToastApi>(() => ({
    success: message => push('success', message),
    error: message => push('error', message),
    info: message => push('info', message),
  }), [push])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-stack" role="status" aria-live="polite">
        {toasts.map(({ id, tone, message }) => {
          const Icon = icons[tone]
          return (
            <div key={id} className={`toast toast-${tone}`}>
              <Icon />
              <span>{message}</span>
              <button onClick={() => dismiss(id)} aria-label="Dismiss"><X /></button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used inside ToastProvider')
  return context
}
