import { UtensilsCrossed, Map, LibraryBig, CircleAlert, Megaphone, LayoutDashboard, ShieldCheck } from 'lucide-react'
import type { ModuleKey, Role } from '../types'
import { REVIEW_MODE } from '../config'

export interface ModuleInfo {
  key: ModuleKey
  label: string
  title: string
  description: string
  icon: typeof LayoutDashboard
  roles?: Role[]
}

export const modules: ModuleInfo[] = [
  { key: 'dashboard', label: 'Dashboard', title: 'Dashboard', icon: LayoutDashboard, description: 'Campus overview' },
  { key: 'mess', label: 'Mess Feedback', title: 'Mess Feedback', icon: UtensilsCrossed, description: 'Menus, ratings & reviews' },
  { key: 'navigation', label: 'Campus Navigation', title: 'Campus Navigation', icon: Map, description: 'Find buildings & routes' },
  { key: 'resources', label: 'Academic Resources', title: 'Academic Resources', icon: LibraryBig, description: 'Notes & assignments' },
  { key: 'complaints', label: 'Complaints', title: 'Complaint Management', icon: CircleAlert, description: 'Raise & track requests' },
  { key: 'updates', label: 'Campus Updates', title: 'Announcements & Events', icon: Megaphone, description: 'News, notices & events' },
  { key: 'admin', label: 'Admin Panel', title: 'Admin Dashboard', icon: ShieldCheck, description: 'Platform administration', roles: ['admin'] },
]

export const canAccess = (module: ModuleKey, role: Role) => {
  // In review mode every module's design page is visible to everyone.
  if (REVIEW_MODE) return true
  const info = modules.find(item => item.key === module)
  return !info?.roles || info.roles.includes(role)
}
