import { useCallback, useEffect, useState } from 'react'
import type { Route } from '../types'

const routes: Route[] = ['dashboard', 'mess', 'navigation', 'resources', 'complaints', 'updates', 'admin', 'profile', 'login', 'register']

const parse = (): Route => {
  const value = window.location.hash.replace(/^#\/?/, '') as Route
  return routes.includes(value) ? value : 'dashboard'
}

/** Minimal hash router: `#/mess` → 'mess'. Keeps browser back/forward working without a routing library. */
export function useHashRoute() {
  const [route, setRoute] = useState<Route>(parse)

  useEffect(() => {
    const onChange = () => setRoute(parse())
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  const navigate = useCallback((next: Route) => {
    if (parse() !== next) window.location.hash = `/${next}`
    setRoute(next)
    window.scrollTo({ top: 0 })
  }, [])

  return [route, navigate] as const
}
