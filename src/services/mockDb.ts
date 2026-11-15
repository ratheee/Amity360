import type { Announcement, Assignment, Complaint, MessFeedback, Notification, Resource, User } from '../types'
import { seedAnnouncements, seedAssignments, seedComplaints, seedFeedback, seedNotifications, seedResources, seedUsers } from '../data/seed'
import { uid } from '../utils/format'

/**
 * Browser-only stand-in for the backend database, persisted to localStorage.
 * Replaced by the Express + MongoDB API in the backend phase.
 */

export interface StoredUser extends User {
  passwordHash: string
  salt: string
}

export interface Database {
  version: 2
  ticketCounter: number
  users: StoredUser[]
  feedback: MessFeedback[]
  complaints: Complaint[]
  resources: Resource[]
  assignments: Assignment[]
  announcements: Announcement[]
  notifications: Notification[]
}

const STORAGE_KEY = 'amity360.db'
let cache: Promise<Database> | null = null

export const hashPassword = async (password: string, salt: string) => {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${salt}:${password}`))
  return Array.from(new Uint8Array(bytes), byte => byte.toString(16).padStart(2, '0')).join('')
}

export const createStoredUser = async (user: User, password: string): Promise<StoredUser> => {
  const salt = uid()
  return { ...user, salt, passwordHash: await hashPassword(password, salt) }
}

const createSeed = async (): Promise<Database> => ({
  version: 2,
  ticketCounter: 1000 + seedComplaints.length,
  users: await Promise.all(seedUsers.map(({ password, ...user }) => createStoredUser(user, password))),
  feedback: seedFeedback,
  complaints: seedComplaints,
  resources: seedResources,
  assignments: seedAssignments,
  announcements: seedAnnouncements,
  notifications: seedNotifications,
})

const load = async () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Database
      if (parsed.version === 2) return parsed
    }
  } catch {
    // Corrupt or unavailable storage: fall through and reseed.
  }
  const db = await createSeed()
  saveDb(db)
  return db
}

export const getDb = () => (cache ??= load())

export const saveDb = (db: Database) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
  } catch {
    // Storage may be full or blocked; the in-memory copy still works for this session.
  }
}

export const resetDb = () => {
  localStorage.removeItem(STORAGE_KEY)
  cache = null
}
