import { useEffect, useMemo, useRef, useState } from 'react'
import { Bell, CheckCheck, Menu, Search } from 'lucide-react'
import type { ModuleKey, Route } from '../../types'
import { canAccess, modules } from '../../data/modules'
import { buildings } from '../../data/campus'
import { useCurrentUser } from '../../context/AuthContext'
import { useAsync } from '../../hooks/useAsync'
import { api } from '../../services/api'
import { initials, timeAgo } from '../../utils/format'
import { REVIEW_MODE } from '../../config'

interface TopbarProps {
  route: Route
  onMenu: () => void
  onNavigate: (key: ModuleKey) => void
}

/** Close a popover when clicking outside its container. */
function useClickOutside(onOutside: () => void) {
  const ref = useRef<HTMLDivElement>(null)
  const callback = useRef(onOutside)
  callback.current = onOutside
  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) callback.current()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])
  return ref
}

export function Topbar({ route, onMenu, onNavigate }: TopbarProps) {
  const user = useCurrentUser()
  const [term, setTerm] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const notifications = useAsync(() => api.notifications.list(user), [user.id])
  const { reload } = notifications

  // Refresh on navigation (actions on a page often create notifications) and periodically.
  useEffect(() => {
    reload()
    const timer = setInterval(reload, 20_000)
    return () => clearInterval(timer)
  }, [route, reload])

  const searchRef = useClickOutside(() => setSearchOpen(false))
  const notifRef = useClickOutside(() => setNotifOpen(false))

  const results = useMemo(() => {
    const q = term.trim().toLowerCase()
    if (!q) return []
    const moduleHits = modules
      .filter(item => canAccess(item.key, user.role) && `${item.label} ${item.description}`.toLowerCase().includes(q))
      .map(item => ({ id: item.key, label: item.label, detail: item.description, target: item.key }))
    const placeHits = buildings
      .filter(item => item.name.toLowerCase().includes(q))
      .map(item => ({ id: item.id, label: item.name, detail: 'Campus location', target: 'navigation' as ModuleKey }))
    return [...moduleHits, ...placeHits].slice(0, 7)
  }, [term, user.role])

  const unread = notifications.data?.filter(item => !item.read).length ?? 0

  const go = (target: ModuleKey) => {
    onNavigate(target)
    setTerm('')
    setSearchOpen(false)
    setNotifOpen(false)
  }

  const markAll = async () => {
    await api.notifications.markRead(user)
    reload()
  }

  const openNotification = async (id: string, link?: ModuleKey) => {
    await api.notifications.markRead(user, id)
    reload()
    if (link && canAccess(link, user.role)) go(link)
  }

  return (
    <header className="topbar">
      <button className="menu-button" onClick={onMenu} aria-label="Open menu"><Menu /></button>
      <div className="search-wrap" ref={searchRef}>
        <div className="search">
          <Search />
          <input
            placeholder="Search services or places…"
            value={term}
            onChange={event => { setTerm(event.target.value); setSearchOpen(true) }}
            onFocus={() => setSearchOpen(true)}
            onKeyDown={event => event.key === 'Enter' && results[0] && go(results[0].target)}
            aria-label="Search"
          />
        </div>
        {searchOpen && term && (
          <div className="popover search-results">
            {results.length ? results.map(item => (
              <button key={item.id} onClick={() => go(item.target)}>
                <strong>{item.label}</strong><span>{item.detail}</span>
              </button>
            )) : <p className="popover-empty">No matches for “{term}”</p>}
          </div>
        )}
      </div>
      <div className="top-actions">
        <div className="notif-wrap" ref={notifRef} hidden={REVIEW_MODE}>
          <button aria-label={`Notifications${unread ? ` (${unread} unread)` : ''}`} className="icon-button" onClick={() => setNotifOpen(open => !open)}>
            <Bell />{unread > 0 && <i />}
          </button>
          {notifOpen && (
            <div className="popover notif-panel">
              <div className="notif-head">
                <strong>Notifications</strong>
                {unread > 0 && <button onClick={markAll}><CheckCheck /> Mark all read</button>}
              </div>
              {notifications.data?.length ? notifications.data.map(item => (
                <button key={item.id} className={`notif-item ${item.read ? '' : 'unread'}`} onClick={() => openNotification(item.id, item.link)}>
                  <strong>{item.title}</strong>
                  <span>{item.body}</span>
                  <small>{timeAgo(item.createdAt)}</small>
                </button>
              )) : <p className="popover-empty">You’re all caught up.</p>}
            </div>
          )}
        </div>
        <button className="mini-avatar" onClick={() => onNavigate('profile')} aria-label="Profile">{initials(user.name)}</button>
      </div>
    </header>
  )
}
