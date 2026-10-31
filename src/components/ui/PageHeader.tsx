import type { ReactNode } from 'react'
import type { ModuleKey } from '../../types'
import { modules } from '../../data/modules'

/** Page title row using the module's icon and tone from the module registry. */
export function PageHeader({ module, subtitle, actions }: { module: ModuleKey; subtitle: string; actions?: ReactNode }) {
  const index = modules.findIndex(item => item.key === module)
  const info = modules[index]
  const Icon = info.icon
  return (
    <section className="module-heading">
      <div className={`module-hero-icon tone-${index}`}><Icon /></div>
      <div className="module-heading-text">
        <span className="eyebrow">AMITY 360 SERVICE</span>
        <h1>{info.title}</h1>
        <p>{subtitle}</p>
      </div>
      {actions && <div className="module-actions">{actions}</div>}
    </section>
  )
}
