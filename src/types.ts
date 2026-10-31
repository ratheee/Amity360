export type Role = 'student' | 'faculty' | 'admin'

export type ModuleKey = 'dashboard' | 'mess' | 'navigation' | 'resources' | 'complaints' | 'updates' | 'admin' | 'profile'
export type Route = ModuleKey | 'login' | 'register'

export interface User {
  id: string
  name: string
  email: string
  role: Role
  enrollmentNo?: string
  program?: string
  semester?: number
  department?: string
  createdAt: string
}

export type MealType = 'breakfast' | 'lunch' | 'snacks' | 'dinner'

export interface MenuDay {
  day: string
  meals: Record<MealType, string[]>
}

export interface MessFeedback {
  id: string
  userId: string
  userName: string
  date: string
  meal: MealType
  rating: number
  taste: number
  hygiene: number
  quantity: number
  comment: string
  createdAt: string
}

export type ComplaintStatus = 'open' | 'in_progress' | 'resolved' | 'rejected'
export type ComplaintCategory = 'hostel' | 'mess' | 'academic' | 'infrastructure' | 'it' | 'transport' | 'other'
export type Priority = 'low' | 'medium' | 'high'

export interface ComplaintUpdate {
  status: ComplaintStatus
  note: string
  by: string
  at: string
}

export interface Complaint {
  id: string
  ticket: string
  userId: string
  userName: string
  title: string
  description: string
  category: ComplaintCategory
  location: string
  priority: Priority
  status: ComplaintStatus
  createdAt: string
  updatedAt: string
  history: ComplaintUpdate[]
}

export type ResourceType = 'notes' | 'slides' | 'paper' | 'book' | 'video'

export interface Resource {
  id: string
  title: string
  description: string
  subject: string
  semester: number
  type: ResourceType
  url: string
  uploadedBy: string
  createdAt: string
}

export interface Submission {
  userId: string
  userName: string
  link: string
  note: string
  submittedAt: string
  marks?: number
}

export interface Assignment {
  id: string
  title: string
  subject: string
  description: string
  dueDate: string
  maxMarks: number
  createdBy: string
  createdByName: string
  createdAt: string
  submissions: Submission[]
}

export type AnnouncementCategory = 'academic' | 'event' | 'campus' | 'sports' | 'placement'

export interface EventDetails {
  date: string
  time: string
  venue: string
  rsvps: string[]
}

export interface Announcement {
  id: string
  title: string
  body: string
  category: AnnouncementCategory
  pinned: boolean
  createdBy: string
  createdByName: string
  createdAt: string
  event?: EventDetails
}

export interface Notification {
  id: string
  userId: string
  title: string
  body: string
  read: boolean
  createdAt: string
  link?: ModuleKey
}

export interface AdminStats {
  users: Record<Role, number>
  complaints: Record<ComplaintStatus, number>
  messAverage: number
  messByMeal: Record<MealType, { average: number; count: number }>
  upcomingEvents: number
  resources: number
  assignments: number
}
