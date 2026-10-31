import type {
  AdminStats, Announcement, AnnouncementCategory, Assignment, Complaint, ComplaintCategory, ComplaintStatus,
  MealType, MessFeedback, ModuleKey, Notification, Priority, Resource, ResourceType, Role, User,
} from '../types'
import { weeklyMenu } from '../data/seed'
import { complaintStatusLabels } from '../data/labels'
import { createStoredUser, getDb, hashPassword, saveDb, type Database, type StoredUser } from './mockDb'
import { dayKey, uid } from '../utils/format'

/**
 * Single entry point for all data access. Every page talks to `api`, never to storage.
 * Methods mirror the planned REST endpoints so the backend phase only swaps this file's internals.
 */

export class ApiError extends Error {
  constructor(message: string, public status = 400) {
    super(message)
  }
}

const SESSION_KEY = 'amity360.session'
const latency = () => new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 200))

const publicUser = ({ passwordHash: _hash, salt: _salt, ...user }: StoredUser): User => user

const requireRole = (actor: User, ...roles: Role[]) => {
  if (!roles.includes(actor.role)) throw new ApiError('You do not have permission to perform this action.', 403)
}

const notify = (db: Database, userIds: string[], title: string, body: string, link?: ModuleKey) => {
  const createdAt = new Date().toISOString()
  db.notifications.unshift(...userIds.map(userId => ({ id: uid(), userId, title, body, link, read: false, createdAt })))
}

const usersWithRole = (db: Database, ...roles: Role[]) => db.users.filter(user => roles.includes(user.role)).map(user => user.id)

/** Runs a mutation against the database and persists it. */
const mutate = async <T>(fn: (db: Database) => T | Promise<T>) => {
  await latency()
  const db = await getDb()
  const result = await fn(db)
  saveDb(db)
  return structuredClone(result)
}

const query = async <T>(fn: (db: Database) => T) => {
  await latency()
  return structuredClone(fn(await getDb()))
}

export interface RegisterInput {
  name: string
  email: string
  password: string
  role: Role
  enrollmentNo?: string
  program?: string
  semester?: number
  department?: string
}

export interface FeedbackInput {
  meal: MealType
  rating: number
  taste: number
  hygiene: number
  quantity: number
  comment: string
}

export interface ComplaintInput {
  title: string
  description: string
  category: ComplaintCategory
  location: string
  priority: Priority
}

export type ResourceInput = Omit<Resource, 'id' | 'uploadedBy' | 'createdAt'>
export type AssignmentInput = Pick<Assignment, 'title' | 'subject' | 'description' | 'dueDate' | 'maxMarks'>
export interface AnnouncementInput {
  title: string
  body: string
  category: AnnouncementCategory
  pinned: boolean
  event?: { date: string; time: string; venue: string }
}

export const api = {
  auth: {
    async login(email: string, password: string) {
      await latency()
      const db = await getDb()
      const user = db.users.find(item => item.email.toLowerCase() === email.trim().toLowerCase())
      if (!user || (await hashPassword(password, user.salt)) !== user.passwordHash) {
        throw new ApiError('Incorrect email or password.', 401)
      }
      localStorage.setItem(SESSION_KEY, user.id)
      return publicUser(user)
    },

    async register(input: RegisterInput) {
      // Admin accounts can only be created by an existing admin.
      if (input.role === 'admin') throw new ApiError('Administrator accounts cannot be self-registered.', 403)
      return mutate(async db => {
        const email = input.email.trim().toLowerCase()
        if (db.users.some(user => user.email.toLowerCase() === email)) throw new ApiError('An account with this email already exists.', 409)
        if (input.enrollmentNo && db.users.some(user => user.enrollmentNo?.toUpperCase() === input.enrollmentNo?.toUpperCase())) {
          throw new ApiError('This enrollment number is already registered.', 409)
        }
        const user: User = {
          id: uid(),
          name: input.name.trim(),
          email,
          role: input.role,
          createdAt: new Date().toISOString(),
          ...(input.role === 'student'
            ? { enrollmentNo: input.enrollmentNo?.toUpperCase(), program: input.program, semester: input.semester }
            : { department: input.department }),
        }
        db.users.push(await createStoredUser(user, input.password))
        notify(db, [user.id], 'Welcome to Amity 360', 'Your account is ready. Explore campus services from the dashboard.', 'dashboard')
        notify(db, usersWithRole(db, 'admin'), 'New registration', `${user.name} joined as ${user.role}.`, 'admin')
        localStorage.setItem(SESSION_KEY, user.id)
        return user
      })
    },

    async currentUser() {
      const id = localStorage.getItem(SESSION_KEY)
      if (!id) return null
      const db = await getDb()
      const user = db.users.find(item => item.id === id)
      return user ? publicUser(user) : null
    },

    async updateProfile(actor: User, changes: Partial<Pick<User, 'name' | 'program' | 'semester' | 'department'>>) {
      return mutate(db => {
        const user = db.users.find(item => item.id === actor.id)
        if (!user) throw new ApiError('User not found.', 404)
        Object.assign(user, changes)
        return publicUser(user)
      })
    },

    async changePassword(actor: User, current: string, next: string) {
      return mutate(async db => {
        const user = db.users.find(item => item.id === actor.id)
        if (!user || (await hashPassword(current, user.salt)) !== user.passwordHash) throw new ApiError('Current password is incorrect.', 401)
        user.passwordHash = await hashPassword(next, user.salt)
      })
    },

    logout() {
      localStorage.removeItem(SESSION_KEY)
    },
  },

  mess: {
    menu: () => weeklyMenu,

    listFeedback: () => query(db => [...db.feedback].sort((a, b) => b.createdAt.localeCompare(a.createdAt))),

    async submitFeedback(actor: User, input: FeedbackInput) {
      requireRole(actor, 'student')
      return mutate(db => {
        const date = dayKey()
        if (db.feedback.some(item => item.userId === actor.id && item.date === date && item.meal === input.meal)) {
          throw new ApiError('You have already rated this meal today.', 409)
        }
        const feedback: MessFeedback = { ...input, id: uid(), userId: actor.id, userName: actor.name, date, comment: input.comment.trim(), createdAt: new Date().toISOString() }
        db.feedback.unshift(feedback)
        if (input.rating <= 2) notify(db, usersWithRole(db, 'admin'), 'Low mess rating', `${input.meal} rated ${input.rating}/5 by ${actor.name}.`, 'admin')
        return feedback
      })
    },
  },

  complaints: {
    list: (actor: User) =>
      query(db => db.complaints.filter(item => actor.role === 'admin' || item.userId === actor.id).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))),

    async create(actor: User, input: ComplaintInput) {
      return mutate(db => {
        const now = new Date().toISOString()
        db.ticketCounter += 1
        const complaint: Complaint = {
          ...input,
          id: uid(),
          ticket: `AMY-${db.ticketCounter}`,
          userId: actor.id,
          userName: actor.name,
          status: 'open',
          createdAt: now,
          updatedAt: now,
          history: [{ status: 'open', note: 'Complaint submitted', by: actor.name, at: now }],
        }
        db.complaints.unshift(complaint)
        notify(db, usersWithRole(db, 'admin'), 'New complaint', `${complaint.ticket}: ${complaint.title}`, 'admin')
        return complaint
      })
    },

    async updateStatus(actor: User, id: string, status: ComplaintStatus, note: string) {
      requireRole(actor, 'admin')
      return mutate(db => {
        const complaint = db.complaints.find(item => item.id === id)
        if (!complaint) throw new ApiError('Complaint not found.', 404)
        const now = new Date().toISOString()
        complaint.status = status
        complaint.updatedAt = now
        complaint.history.push({ status, note: note.trim() || `Marked as ${complaintStatusLabels[status]}`, by: actor.name, at: now })
        notify(db, [complaint.userId], 'Complaint updated', `${complaint.ticket} is now ${complaintStatusLabels[status]}.`, 'complaints')
        return complaint
      })
    },
  },

  resources: {
    list: () => query(db => [...db.resources].sort((a, b) => b.createdAt.localeCompare(a.createdAt))),

    async create(actor: User, input: ResourceInput) {
      requireRole(actor, 'faculty', 'admin')
      return mutate(db => {
        const resource: Resource = { ...input, id: uid(), uploadedBy: actor.name, createdAt: new Date().toISOString() }
        db.resources.unshift(resource)
        return resource
      })
    },

    async remove(actor: User, id: string) {
      requireRole(actor, 'faculty', 'admin')
      return mutate(db => {
        db.resources = db.resources.filter(item => item.id !== id)
      })
    },
  },

  assignments: {
    list: () => query(db => [...db.assignments].sort((a, b) => a.dueDate.localeCompare(b.dueDate))),

    async create(actor: User, input: AssignmentInput) {
      requireRole(actor, 'faculty', 'admin')
      return mutate(db => {
        const assignment: Assignment = { ...input, id: uid(), createdBy: actor.id, createdByName: actor.name, createdAt: new Date().toISOString(), submissions: [] }
        db.assignments.push(assignment)
        notify(db, usersWithRole(db, 'student'), 'New assignment', `${assignment.title} (${assignment.subject})`, 'resources')
        return assignment
      })
    },

    async submit(actor: User, id: string, link: string, note: string) {
      requireRole(actor, 'student')
      return mutate(db => {
        const assignment = db.assignments.find(item => item.id === id)
        if (!assignment) throw new ApiError('Assignment not found.', 404)
        if (new Date(assignment.dueDate) < new Date()) throw new ApiError('The deadline for this assignment has passed.', 400)
        const submission = { userId: actor.id, userName: actor.name, link, note: note.trim(), submittedAt: new Date().toISOString() }
        assignment.submissions = [...assignment.submissions.filter(item => item.userId !== actor.id), submission]
        return assignment
      })
    },

    async grade(actor: User, id: string, userId: string, marks: number) {
      requireRole(actor, 'faculty', 'admin')
      return mutate(db => {
        const assignment = db.assignments.find(item => item.id === id)
        const submission = assignment?.submissions.find(item => item.userId === userId)
        if (!assignment || !submission) throw new ApiError('Submission not found.', 404)
        if (marks < 0 || marks > assignment.maxMarks) throw new ApiError(`Marks must be between 0 and ${assignment.maxMarks}.`)
        submission.marks = marks
        notify(db, [userId], 'Assignment graded', `You scored ${marks}/${assignment.maxMarks} in ${assignment.title}.`, 'resources')
        return assignment
      })
    },

    async remove(actor: User, id: string) {
      requireRole(actor, 'faculty', 'admin')
      return mutate(db => {
        db.assignments = db.assignments.filter(item => item.id !== id)
      })
    },
  },

  announcements: {
    list: () =>
      query(db => [...db.announcements].sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.createdAt.localeCompare(a.createdAt))),

    async create(actor: User, input: AnnouncementInput) {
      requireRole(actor, 'faculty', 'admin')
      return mutate(db => {
        const announcement: Announcement = {
          id: uid(),
          title: input.title.trim(),
          body: input.body.trim(),
          category: input.category,
          pinned: actor.role === 'admin' && input.pinned,
          createdBy: actor.id,
          createdByName: actor.name,
          createdAt: new Date().toISOString(),
          event: input.event ? { ...input.event, rsvps: [] } : undefined,
        }
        db.announcements.unshift(announcement)
        notify(db, db.users.filter(user => user.id !== actor.id).map(user => user.id), input.event ? 'New event' : 'New announcement', announcement.title, 'updates')
        return announcement
      })
    },

    async remove(actor: User, id: string) {
      return mutate(db => {
        const item = db.announcements.find(entry => entry.id === id)
        if (!item) throw new ApiError('Announcement not found.', 404)
        if (actor.role !== 'admin' && item.createdBy !== actor.id) throw new ApiError('You can only delete your own announcements.', 403)
        db.announcements = db.announcements.filter(entry => entry.id !== id)
      })
    },

    async toggleRsvp(actor: User, id: string) {
      return mutate(db => {
        const item = db.announcements.find(entry => entry.id === id)
        if (!item?.event) throw new ApiError('Event not found.', 404)
        const going = item.event.rsvps.includes(actor.id)
        item.event.rsvps = going ? item.event.rsvps.filter(userId => userId !== actor.id) : [...item.event.rsvps, actor.id]
        return item
      })
    },
  },

  notifications: {
    list: (actor: User) => query(db => db.notifications.filter(item => item.userId === actor.id).slice(0, 30)),

    async markRead(actor: User, id?: string) {
      return mutate(db => {
        db.notifications.forEach((item: Notification) => {
          if (item.userId === actor.id && (!id || item.id === id)) item.read = true
        })
      })
    },
  },

  users: {
    async list(actor: User) {
      requireRole(actor, 'admin')
      return query(db => db.users.map(publicUser).sort((a, b) => a.name.localeCompare(b.name)))
    },

    async updateRole(actor: User, id: string, role: Role) {
      requireRole(actor, 'admin')
      if (id === actor.id) throw new ApiError('You cannot change your own role.')
      return mutate(db => {
        const user = db.users.find(item => item.id === id)
        if (!user) throw new ApiError('User not found.', 404)
        user.role = role
        return publicUser(user)
      })
    },
  },

  stats: {
    async admin(actor: User): Promise<AdminStats> {
      requireRole(actor, 'admin')
      return query(db => {
        const count = <K extends string>(keys: K[], pick: (key: K) => number) => Object.fromEntries(keys.map(key => [key, pick(key)])) as Record<K, number>
        const meals: MealType[] = ['breakfast', 'lunch', 'snacks', 'dinner']
        const avg = (items: MessFeedback[]) => (items.length ? items.reduce((sum, item) => sum + item.rating, 0) / items.length : 0)
        return {
          users: count<Role>(['student', 'faculty', 'admin'], role => db.users.filter(user => user.role === role).length),
          complaints: count<ComplaintStatus>(['open', 'in_progress', 'resolved', 'rejected'], status => db.complaints.filter(item => item.status === status).length),
          messAverage: avg(db.feedback),
          messByMeal: Object.fromEntries(meals.map(meal => {
            const items = db.feedback.filter(item => item.meal === meal)
            return [meal, { average: avg(items), count: items.length }]
          })) as AdminStats['messByMeal'],
          upcomingEvents: db.announcements.filter(item => item.event && new Date(item.event.date) >= new Date()).length,
          resources: db.resources.length,
          assignments: db.assignments.length,
        }
      })
    },
  },
}

export const resourceTypes: ResourceType[] = ['notes', 'slides', 'paper', 'book', 'video']
