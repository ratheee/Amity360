import type { AnnouncementCategory, ComplaintCategory, ComplaintStatus, MealType, Priority, ResourceType, Role } from '../types'

export const roleLabels: Record<Role, string> = { student: 'Student', faculty: 'Faculty', admin: 'Administrator' }

export const mealLabels: Record<MealType, string> = { breakfast: 'Breakfast', lunch: 'Lunch', snacks: 'Evening Snacks', dinner: 'Dinner' }
export const mealTimes: Record<MealType, string> = { breakfast: '7:30 – 9:30 AM', lunch: '12:30 – 2:30 PM', snacks: '5:00 – 6:00 PM', dinner: '7:30 – 9:30 PM' }
export const mealOrder: MealType[] = ['breakfast', 'lunch', 'snacks', 'dinner']

export const complaintCategoryLabels: Record<ComplaintCategory, string> = {
  hostel: 'Hostel',
  mess: 'Mess & Food',
  academic: 'Academic',
  infrastructure: 'Infrastructure',
  it: 'IT & Wi-Fi',
  transport: 'Transport',
  other: 'Other',
}

export const complaintStatusLabels: Record<ComplaintStatus, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  rejected: 'Rejected',
}

export const priorityLabels: Record<Priority, string> = { low: 'Low', medium: 'Medium', high: 'High' }

export const resourceTypeLabels: Record<ResourceType, string> = { notes: 'Notes', slides: 'Slides', paper: 'Past Paper', book: 'Reference Book', video: 'Video Lecture' }

export const announcementCategoryLabels: Record<AnnouncementCategory, string> = {
  academic: 'Academic',
  event: 'Event',
  campus: 'Campus',
  sports: 'Sports',
  placement: 'Placement',
}

export const programs = ['B.Tech CSE', 'B.Tech ECE', 'B.Tech Mechanical', 'BBA', 'MBA', 'BCA', 'MCA', 'B.Com (Hons)', 'BA LLB', 'B.Sc Biotechnology', 'B.Arch']
export const departments = ['Computer Science & Engineering', 'Electronics & Communication', 'Mechanical Engineering', 'Management', 'Law', 'Biotechnology', 'Architecture', 'Administration']
export const subjects = ['Data Structures & Algorithms', 'Computer Networks', 'Database Management Systems', 'Operating Systems', 'Software Engineering', 'Discrete Mathematics', 'Engineering Mathematics', 'Business Communication']
