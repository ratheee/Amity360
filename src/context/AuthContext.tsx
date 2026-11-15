import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { api, type RegisterInput } from '../services/api'
import type { User } from '../types'
import { AuthContext } from './auth'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.auth.currentUser().then(setUser).finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const next = await api.auth.login(email, password)
    setUser(next)
    return next
  }, [])

  const register = useCallback(async (input: RegisterInput) => {
    const next = await api.auth.register(input)
    setUser(next)
    return next
  }, [])

  const logout = useCallback(() => {
    api.auth.logout()
    setUser(null)
  }, [])

  const value = useMemo(() => ({ user, loading, login, register, logout, setUser }), [user, loading, login, register, logout])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
