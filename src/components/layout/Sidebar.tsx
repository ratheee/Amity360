import { LogOut, X } from 'lucide-react'
import type { ModuleKey, Route } from '../../types'
import { canAccess, modules } from '../../data/modules'
import { roleLabels } from '../../data/labels'
import { useAuth, useCurrentUser } from '../../context/auth'
import { initials } from '../../utils/format'

interface SidebarProps {
  active: Route
  open: boolean
  onClose: () => void
  onNavigate: (key: ModuleKey) => void
}

export function Sidebar({ active, open, onClose, onNavigate }: SidebarProps) {
  const user = useCurrentUser()
  const { logout } = useAuth()
  const subtitle = user.role === 'student' ? `${user.program ?? 'Student'}${user.semester ? ` · Sem ${user.semester}` : ''}` : roleLabels[user.role]

  return (
    <>
      {open && <button className="overlay" aria-label="Close menu" onClick={onClose} />}
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="brand">
          <div className="brand-mark">A<span>360</span></div>
          <div><strong>AMITY</strong><small>UNIVERSITY RAJASTHAN</small></div>
        </div>
        <button className="close-menu" onClick={onClose} aria-label="Close"><X /></button>
        <nav aria-label="Main">
          {modules.filter(item => canAccess(item.key, user.role)).map(({ key, label, icon: Icon }) => (
            <button key={key} className={active === key ? 'nav-item active' : 'nav-item'} onClick={() => onNavigate(key)} aria-current={active === key ? 'page' : undefined}>
              <Icon /><span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="student-card">
          <button className="student-card-main" onClick={() => onNavigate('profile')} title="View profile">
            <div className="avatar">{initials(user.name)}</div>
            <div><strong>{user.name}</strong><small>{subtitle}</small></div>
          </button>
          <button className="icon-button" onClick={logout} aria-label="Sign out" title="Sign out"><LogOut /></button>
        </div>
      </aside>
    </>
  )
}
