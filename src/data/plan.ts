import type { ModuleKey } from '../types'

/** Requirement-analysis output for each module, shown on its design page in review mode. */
export interface ModulePlan {
  users: string
  features: string[]
  workflow: string[]
}

export const modulePlans: Partial<Record<ModuleKey, ModulePlan>> = {
  mess: {
    users: 'Students submit feedback · Admin monitors ratings',
    features: ['Daily and weekly mess menu', 'Meal-wise star ratings (taste, hygiene, quantity)', 'Comments and suggestions', 'One rating per meal per day', 'Average rating reports for the mess committee'],
    workflow: ['Student views today’s menu', 'Selects a meal and gives ratings', 'Feedback is validated and stored', 'Admin reviews averages and low ratings'],
  },
  navigation: {
    users: 'Students, faculty and visitors',
    features: ['Interactive campus map', 'Building search and category filters', 'Building details: timings and facilities', 'Shortest walking route between two places', 'Distance and walking-time estimate'],
    workflow: ['User searches or taps a building', 'Building details are displayed', 'User picks start and destination', 'Shortest route is drawn on the map'],
  },
  resources: {
    users: 'Faculty upload · Students access and submit',
    features: ['Notes, slides, past papers and video lectures', 'Filter by subject, semester and type', 'Assignment creation with due dates', 'Online assignment submission', 'Grading with marks notification'],
    workflow: ['Faculty uploads material or creates an assignment', 'Students are notified', 'Students download material / submit work', 'Faculty grades and student sees marks'],
  },
  complaints: {
    users: 'Students raise · Admin resolves',
    features: ['Complaint form with category, location and priority', 'Unique ticket number for every complaint', 'Status tracking: Open → In Progress → Resolved', 'Timeline of every update', 'Notification on each status change'],
    workflow: ['Student submits a complaint', 'Ticket is generated and admin notified', 'Admin updates status with remarks', 'Student tracks progress until resolved'],
  },
  updates: {
    users: 'Faculty and admin post · Everyone reads',
    features: ['Official announcements by category', 'Campus events with date, time and venue', 'Event RSVP', 'Pinned important notices', 'Notifications for new posts'],
    workflow: ['Faculty / admin creates a post', 'All users are notified', 'Users read and filter updates', 'Students RSVP to events'],
  },
  admin: {
    users: 'University administrators',
    features: ['Overview statistics for all modules', 'Complaint management queue', 'Mess feedback analytics', 'User and role management', 'Announcement moderation'],
    workflow: ['Admin signs in with admin role', 'Views campus-wide statistics', 'Acts on complaints and feedback', 'Manages users and roles'],
  },
}

export interface Phase {
  name: string
  detail: string
  status: 'done' | 'current' | 'upcoming'
}

export const phases: Phase[] = [
  { name: 'Planning & requirement analysis', detail: 'Problem study, user roles, scope of 7 modules', status: 'done' },
  { name: 'System & UI design', detail: 'Module workflows, app layout, login and dashboard screens', status: 'done' },
  { name: 'Frontend development', detail: 'Building each module’s screens in React', status: 'current' },
  { name: 'Backend & database', detail: 'Node.js / Express APIs with MongoDB', status: 'upcoming' },
  { name: 'Integration & testing', detail: 'Connect modules, authentication, testing', status: 'upcoming' },
  { name: 'Deployment', detail: 'Hosting and final presentation', status: 'upcoming' },
]

export const techStack = [
  { layer: 'Frontend', items: ['React', 'TypeScript', 'Vite'] },
  { layer: 'Backend', items: ['Node.js', 'Express.js', 'REST APIs'] },
  { layer: 'Database', items: ['MongoDB', 'Mongoose'] },
  { layer: 'Security', items: ['JWT authentication', 'bcrypt', 'Role-based access'] },
  { layer: 'Tools', items: ['Git & GitHub', 'VS Code', 'Vitest'] },
]
