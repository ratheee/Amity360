import type { ReactNode } from 'react'

interface PanelProps {
  eyebrow?: string
  title?: string
  action?: ReactNode
  children: ReactNode
  className?: string
}

export function Panel({ eyebrow, title, action, children, className = '' }: PanelProps) {
  return (
    <section className={`panel ${className}`}>
      {(title || action) && (
        <div className="panel-head">
          <div>
            {eyebrow && <span className="eyebrow">{eyebrow}</span>}
            {title && <h2>{title}</h2>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  )
}
