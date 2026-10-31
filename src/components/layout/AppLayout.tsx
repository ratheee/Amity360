import { useState, type ReactNode } from 'react'
import type { ModuleKey, Route } from '../../types'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

interface AppLayoutProps {
  route: Route
  onNavigate: (key: ModuleKey) => void
  children: ReactNode
}

export function AppLayout({ route, onNavigate, children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navigate = (key: ModuleKey) => {
    onNavigate(key)
    setSidebarOpen(false)
  }

  return (
    <div className="app-shell">
      <Sidebar active={route} open={sidebarOpen} onClose={() => setSidebarOpen(false)} onNavigate={navigate} />
      <main>
        <Topbar route={route} onMenu={() => setSidebarOpen(true)} onNavigate={navigate} />
        <div className="content" key={route}>{children}</div>
      </main>
    </div>
  )
}
