import type { ReactNode } from 'react'

interface StatCardProps {
  label: string
  value: ReactNode
  detail?: ReactNode
  icon: ReactNode
  tone?: number
}

export function StatCard({ label, value, detail, icon, tone = 0 }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className={`quick-icon tone-${tone}`}>{icon}</div>
      <div>
        <span className="stat-label">{label}</span>
        <strong className="stat-value">{value}</strong>
        {detail && <span className="stat-detail">{detail}</span>}
      </div>
    </div>
  )
}
