import type { Announcement, Assignment, Complaint, MenuDay, MessFeedback, Notification, Resource, User } from '../types'
import { dayKey } from '../utils/format'

/** Demo accounts shown on the login screen. Passwords are hashed when the mock database is first created. */
export const demoAccounts = [
  { email: 'student@amity360.edu', password: 'Student@123', role: 'student' as const },
  { email: 'faculty@amity360.edu', password: 'Faculty@123', role: 'faculty' as const },
  { email: 'admin@amity360.edu', password: 'Admin@123', role: 'admin' as const },
]

const daysFromNow = (days: number, hour = 10) => {
  const date = new Date()
  date.setDate(date.getDate() + days)
  date.setHours(hour, 0, 0, 0)
  return date.toISOString()
}

export const seedUsers: (User & { password: string })[] = [
  { id: 'u-student', name: 'Arjun Sharma', email: demoAccounts[0].email, password: demoAccounts[0].password, role: 'student', enrollmentNo: 'A50105223041', program: 'B.Tech CSE', semester: 5, createdAt: daysFromNow(-120) },
  { id: 'u-student2', name: 'Priya Meena', email: 'priya@amity360.edu', password: 'Student@123', role: 'student', enrollmentNo: 'A50105223077', program: 'BBA', semester: 3, createdAt: daysFromNow(-90) },
  { id: 'u-student3', name: 'Rohan Verma', email: 'rohan@amity360.edu', password: 'Student@123', role: 'student', enrollmentNo: 'A50105223102', program: 'B.Tech ECE', semester: 5, createdAt: daysFromNow(-60) },
  { id: 'u-faculty', name: 'Dr. Neha Gupta', email: demoAccounts[1].email, password: demoAccounts[1].password, role: 'faculty', department: 'Computer Science & Engineering', createdAt: daysFromNow(-400) },
  { id: 'u-admin', name: 'Campus Administrator', email: demoAccounts[2].email, password: demoAccounts[2].password, role: 'admin', department: 'Administration', createdAt: daysFromNow(-500) },
]

export const weeklyMenu: MenuDay[] = [
  { day: 'Monday', meals: { breakfast: ['Aloo Paratha', 'Curd', 'Tea / Coffee'], lunch: ['Rajma', 'Jeera Rice', 'Roti', 'Salad'], snacks: ['Samosa', 'Tea'], dinner: ['Paneer Butter Masala', 'Roti', 'Dal Tadka', 'Gulab Jamun'] } },
  { day: 'Tuesday', meals: { breakfast: ['Poha', 'Boiled Eggs', 'Milk'], lunch: ['Kadhi Pakora', 'Rice', 'Roti', 'Aloo Gobhi'], snacks: ['Bread Pakora', 'Coffee'], dinner: ['Mix Veg', 'Dal Makhani', 'Roti', 'Kheer'] } },
  { day: 'Wednesday', meals: { breakfast: ['Idli Sambar', 'Coconut Chutney', 'Tea'], lunch: ['Chole', 'Bhature', 'Rice', 'Raita'], snacks: ['Veg Sandwich', 'Tea'], dinner: ['Egg Curry / Malai Kofta', 'Rice', 'Roti', 'Ice Cream'] } },
  { day: 'Thursday', meals: { breakfast: ['Upma', 'Banana', 'Coffee'], lunch: ['Dal Baati Churma', 'Gatte ki Sabzi', 'Rice'], snacks: ['Kachori', 'Tea'], dinner: ['Kadai Paneer', 'Roti', 'Moong Dal', 'Halwa'] } },
  { day: 'Friday', meals: { breakfast: ['Chole Kulche', 'Tea / Coffee'], lunch: ['Sambar', 'Rice', 'Roti', 'Bhindi Fry'], snacks: ['Pav Bhaji', 'Tea'], dinner: ['Veg Biryani', 'Raita', 'Mirchi ka Salan', 'Jalebi'] } },
  { day: 'Saturday', meals: { breakfast: ['Methi Thepla', 'Pickle', 'Curd'], lunch: ['Matar Paneer', 'Pulao', 'Roti'], snacks: ['Maggi', 'Coffee'], dinner: ['Chicken Curry / Shahi Paneer', 'Rice', 'Roti', 'Rasgulla'] } },
  { day: 'Sunday', meals: { breakfast: ['Masala Dosa', 'Sambar', 'Chutney'], lunch: ['Special Thali', 'Puri', 'Kheer'], snacks: ['Pakode', 'Tea'], dinner: ['Dal Fry', 'Aloo Jeera', 'Rice', 'Roti'] } },
]

const feedbackDay = (offset: number) => {
  const date = new Date()
  date.setDate(date.getDate() + offset)
  return dayKey(date)
}

export const seedFeedback: MessFeedback[] = [
  { id: 'f1', userId: 'u-student2', userName: 'Priya Meena', date: feedbackDay(0), meal: 'breakfast', rating: 4, taste: 4, hygiene: 5, quantity: 4, comment: 'Parathas were fresh and hot today.', createdAt: daysFromNow(0, 9) },
  { id: 'f2', userId: 'u-student3', userName: 'Rohan Verma', date: feedbackDay(-1), meal: 'dinner', rating: 3, taste: 3, hygiene: 4, quantity: 3, comment: 'Dal was a bit too salty.', createdAt: daysFromNow(-1, 21) },
  { id: 'f3', userId: 'u-student2', userName: 'Priya Meena', date: feedbackDay(-1), meal: 'lunch', rating: 5, taste: 5, hygiene: 4, quantity: 5, comment: 'Dal baati was excellent!', createdAt: daysFromNow(-1, 14) },
  { id: 'f4', userId: 'u-student3', userName: 'Rohan Verma', date: feedbackDay(-2), meal: 'snacks', rating: 2, taste: 2, hygiene: 3, quantity: 2, comment: 'Samosas ran out by 5:20 PM.', createdAt: daysFromNow(-2, 18) },
  { id: 'f5', userId: 'u-student', userName: 'Arjun Sharma', date: feedbackDay(-2), meal: 'lunch', rating: 4, taste: 4, hygiene: 4, quantity: 4, comment: '', createdAt: daysFromNow(-2, 14) },
]

export const seedComplaints: Complaint[] = [
  {
    id: 'c1', ticket: 'AMY-1001', userId: 'u-student', userName: 'Arjun Sharma', title: 'Wi-Fi not working in Room 214', description: 'The hostel Wi-Fi access point on the second floor has been down for two days. Unable to attend online sessions.', category: 'it', location: 'Boys Hostel, Block B, Room 214', priority: 'high', status: 'in_progress', createdAt: daysFromNow(-3), updatedAt: daysFromNow(-1),
    history: [
      { status: 'open', note: 'Complaint submitted', by: 'Arjun Sharma', at: daysFromNow(-3) },
      { status: 'in_progress', note: 'IT team assigned. Replacement access point requested.', by: 'Campus Administrator', at: daysFromNow(-1) },
    ],
  },
  {
    id: 'c2', ticket: 'AMY-1002', userId: 'u-student', userName: 'Arjun Sharma', title: 'Broken chair in Lecture Hall 204', description: 'Two chairs in the third row are broken and unsafe.', category: 'infrastructure', location: 'Academic Block A, Room 204', priority: 'medium', status: 'resolved', createdAt: daysFromNow(-10), updatedAt: daysFromNow(-7),
    history: [
      { status: 'open', note: 'Complaint submitted', by: 'Arjun Sharma', at: daysFromNow(-10) },
      { status: 'in_progress', note: 'Maintenance notified.', by: 'Campus Administrator', at: daysFromNow(-9) },
      { status: 'resolved', note: 'Chairs replaced.', by: 'Campus Administrator', at: daysFromNow(-7) },
    ],
  },
  {
    id: 'c3', ticket: 'AMY-1003', userId: 'u-student2', userName: 'Priya Meena', title: 'Water cooler not cooling', description: 'The water cooler near the girls hostel common room only dispenses warm water.', category: 'hostel', location: 'Girls Hostel, Ground Floor', priority: 'medium', status: 'open', createdAt: daysFromNow(-1), updatedAt: daysFromNow(-1),
    history: [{ status: 'open', note: 'Complaint submitted', by: 'Priya Meena', at: daysFromNow(-1) }],
  },
]

export const seedResources: Resource[] = [
  { id: 'r1', title: 'DSA Unit 3 – Trees & Graphs', description: 'Complete lecture notes with solved examples on BST, AVL trees, BFS and DFS.', subject: 'Data Structures & Algorithms', semester: 3, type: 'notes', url: 'https://example.com/dsa-unit3.pdf', uploadedBy: 'Dr. Neha Gupta', createdAt: daysFromNow(-6) },
  { id: 'r2', title: 'Computer Networks – OSI Model Slides', description: 'Lecture slides covering the 7 OSI layers and TCP/IP mapping.', subject: 'Computer Networks', semester: 5, type: 'slides', url: 'https://example.com/cn-osi.pptx', uploadedBy: 'Dr. Neha Gupta', createdAt: daysFromNow(-4) },
  { id: 'r3', title: 'DBMS End-Semester Paper 2025', description: 'Previous year question paper.', subject: 'Database Management Systems', semester: 5, type: 'paper', url: 'https://example.com/dbms-2025.pdf', uploadedBy: 'Dr. Neha Gupta', createdAt: daysFromNow(-15) },
  { id: 'r4', title: 'Normalization Explained', description: 'Recorded lecture on 1NF to BCNF with examples.', subject: 'Database Management Systems', semester: 5, type: 'video', url: 'https://example.com/normalization', uploadedBy: 'Dr. Neha Gupta', createdAt: daysFromNow(-2) },
  { id: 'r5', title: 'Operating System Concepts (Reference)', description: 'Recommended textbook chapters 5–7: process scheduling and synchronisation.', subject: 'Operating Systems', semester: 5, type: 'book', url: 'https://example.com/os-book', uploadedBy: 'Dr. Neha Gupta', createdAt: daysFromNow(-20) },
]

export const seedAssignments: Assignment[] = [
  { id: 'a1', title: 'Implement Dijkstra’s Algorithm', subject: 'Data Structures & Algorithms', description: 'Implement Dijkstra’s shortest path algorithm using a min-heap. Submit a GitHub link with code and a README containing complexity analysis.', dueDate: daysFromNow(4, 23), maxMarks: 20, createdBy: 'u-faculty', createdByName: 'Dr. Neha Gupta', createdAt: daysFromNow(-3), submissions: [] },
  { id: 'a2', title: 'Subnetting Worksheet', subject: 'Computer Networks', description: 'Solve all 15 subnetting problems in the attached worksheet and upload a scanned PDF.', dueDate: daysFromNow(1, 23), maxMarks: 10, createdBy: 'u-faculty', createdByName: 'Dr. Neha Gupta', createdAt: daysFromNow(-5), submissions: [{ userId: 'u-student3', userName: 'Rohan Verma', link: 'https://example.com/rohan-subnetting.pdf', note: '', submittedAt: daysFromNow(-1) }] },
  { id: 'a3', title: 'ER Diagram – Library System', subject: 'Database Management Systems', description: 'Design an ER diagram for a university library management system.', dueDate: daysFromNow(-2, 23), maxMarks: 15, createdBy: 'u-faculty', createdByName: 'Dr. Neha Gupta', createdAt: daysFromNow(-12), submissions: [{ userId: 'u-student', userName: 'Arjun Sharma', link: 'https://example.com/arjun-er.png', note: 'Included both Chen and Crow’s foot notation.', submittedAt: daysFromNow(-3), marks: 13 }] },
]

export const seedAnnouncements: Announcement[] = [
  { id: 'n1', title: 'Examinations begin on 7 December', body: 'Examinations for all programmes begin on Monday, 7 December 2026. Carry your university ID card to every exam.', category: 'academic', pinned: true, createdBy: 'u-admin', createdByName: 'Campus Administrator', createdAt: daysFromNow(0, 8) },
  { id: 'n2', title: 'Annual cultural fest – registrations open', body: 'Register for dance, music, drama, and fine-arts competitions. Teams of up to 6 members.', category: 'event', pinned: false, createdBy: 'u-admin', createdByName: 'Campus Administrator', createdAt: daysFromNow(-1), event: { date: daysFromNow(12, 17), time: '5:00 PM', venue: 'Main Auditorium', rsvps: ['u-student2'] } },
  { id: 'n3', title: 'Library timings extended during exam week', body: 'The Central Library will remain open until 11:00 PM from Monday to Saturday during examinations.', category: 'campus', pinned: false, createdBy: 'u-admin', createdByName: 'Campus Administrator', createdAt: daysFromNow(-2) },
  { id: 'n4', title: 'Inter-department cricket tournament', body: 'Department teams must submit their squad lists to the Sports Office by Friday.', category: 'sports', pinned: false, createdBy: 'u-admin', createdByName: 'Campus Administrator', createdAt: daysFromNow(-3), event: { date: daysFromNow(6, 9), time: '9:00 AM', venue: 'Sports Complex – Cricket Ground', rsvps: [] } },
  { id: 'n5', title: 'Campus placement drive – software roles', body: 'Final-year B.Tech and MCA students can register for the upcoming placement drive. Update your resume on the placement portal.', category: 'placement', pinned: false, createdBy: 'u-faculty', createdByName: 'Dr. Neha Gupta', createdAt: daysFromNow(-4), event: { date: daysFromNow(9, 10), time: '10:00 AM', venue: 'Academic Block B – Seminar Hall', rsvps: ['u-student'] } },
]

export const seedNotifications: Notification[] = [
  { id: 'nt1', userId: 'u-student', title: 'Complaint updated', body: 'AMY-1001 is now In Progress.', read: false, createdAt: daysFromNow(-1), link: 'complaints' },
  { id: 'nt2', userId: 'u-student', title: 'New assignment', body: 'Implement Dijkstra’s Algorithm is due in 4 days.', read: false, createdAt: daysFromNow(-3), link: 'resources' },
  { id: 'nt3', userId: 'u-student', title: 'Assignment graded', body: 'You scored 13/15 in ER Diagram – Library System.', read: true, createdAt: daysFromNow(-2), link: 'resources' },
  { id: 'nt4', userId: 'u-admin', title: 'New complaint', body: 'AMY-1003: Water cooler not cooling.', read: false, createdAt: daysFromNow(-1), link: 'admin' },
]
