import { createContext, useContext } from 'react'
import type { RegisterInput } from '../services/api'
import type { User } from '../types'

/**
 * Auth context and hooks, kept apart from AuthProvider so the context object survives
 * hot reloads: this file has no runtime imports that change during development.
 */

export interface AuthState {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<User>
  register: (input: RegisterInput) => Promise<User>
  logout: () => void
  setUser: (user: User) => void
}

export const AuthContext = createContext<AuthState | null>(null)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}

/** For pages rendered only behind the auth guard, where a user is guaranteed. */
export function useCurrentUser() {
  const { user } = useAuth()
  if (!user) throw new Error('useCurrentUser called without a signed-in user')
  return user
}
