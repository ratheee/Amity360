/**
 * Illustrative campus map. Coordinates are in SVG units on a 1000 × 700 canvas.
 * Roads are polylines of node ids; every building has a door node on a road,
 * which lets the navigation page compute walking routes with Dijkstra.
 */

export type BuildingCategory = 'academic' | 'hostel' | 'food' | 'sports' | 'admin' | 'health' | 'facility'

export interface Building {
  id: string
  name: string
  short: string
  category: BuildingCategory
  x: number
  y: number
  w: number
  h: number
  door: string
  hours: string
  description: string
  facilities: string[]
}

export const categoryLabels: Record<BuildingCategory, string> = {
  academic: 'Academic',
  hostel: 'Hostels',
  food: 'Food',
  sports: 'Sports',
  admin: 'Administration',
  health: 'Health',
  facility: 'Facilities',
}

export const nodes: Record<string, [number, number]> = {
  gate: [60, 320], adminD: [150, 320], j1: [250, 320], acadA: [340, 320], acadB: [410, 320], j2: [500, 320], lib: [600, 320], aud: [650, 320], j3: [750, 320],
  nw: [250, 100], med: [250, 400], park: [250, 500], sw: [250, 540],
  nm: [500, 100], sm: [500, 540],
  ne: [750, 100], sports: [750, 205], mess: [750, 405], research: [750, 500], se: [750, 540],
  boys: [375, 540], girls: [625, 540],
}

export const roads: string[][] = [
  ['gate', 'adminD', 'j1', 'acadA', 'acadB', 'j2', 'lib', 'aud', 'j3'],
  ['nw', 'j1', 'med', 'park', 'sw'],
  ['nm', 'j2', 'sm'],
  ['ne', 'sports', 'j3', 'mess', 'research', 'se'],
  ['nw', 'nm', 'ne'],
  ['sw', 'boys', 'sm', 'girls', 'se'],
]

export const buildings: Building[] = [
  { id: 'gate', name: 'Main Gate', short: 'Gate', category: 'facility', x: 18, y: 290, w: 42, h: 60, door: 'gate', hours: 'Open 24 hours', description: 'Main entry and exit point with security desk and visitor registration.', facilities: ['Security desk', 'Visitor passes', 'Shuttle stop'] },
  { id: 'admin', name: 'Administrative Block', short: 'Admin', category: 'admin', x: 95, y: 195, w: 110, h: 95, door: 'adminD', hours: 'Mon–Sat, 9:00 AM – 5:00 PM', description: 'Admissions, accounts, examination cell and the registrar’s office.', facilities: ['Admissions office', 'Accounts & fees', 'Examination cell', 'Registrar'] },
  { id: 'acadA', name: 'Academic Block A', short: 'Block A', category: 'academic', x: 285, y: 140, w: 180, h: 150, door: 'acadA', hours: 'Mon–Sat, 8:00 AM – 6:00 PM', description: 'Engineering and computer science departments, lecture halls 101–310.', facilities: ['Lecture halls', 'Computer labs 1–4', 'Faculty cabins', 'Department offices'] },
  { id: 'acadB', name: 'Academic Block B', short: 'Block B', category: 'academic', x: 285, y: 350, w: 180, h: 150, door: 'acadB', hours: 'Mon–Sat, 8:00 AM – 6:00 PM', description: 'Management, law and applied sciences with the seminar hall.', facilities: ['Seminar hall', 'Moot court', 'Electronics labs', 'Placement cell'] },
  { id: 'library', name: 'Central Library', short: 'Library', category: 'academic', x: 535, y: 140, w: 180, h: 150, door: 'lib', hours: 'Daily, 8:00 AM – 10:00 PM', description: 'Over 60,000 volumes, digital library, journals and silent reading halls.', facilities: ['Reading halls', 'Digital library', 'Group study rooms', 'Printing'] },
  { id: 'auditorium', name: 'Main Auditorium', short: 'Auditorium', category: 'facility', x: 535, y: 350, w: 180, h: 120, door: 'aud', hours: 'As per event schedule', description: '1,200-seat auditorium for convocations, fests and guest lectures.', facilities: ['1,200 seats', 'Green rooms', 'AV control room'] },
  { id: 'sports', name: 'Sports Complex', short: 'Sports', category: 'sports', x: 790, y: 120, w: 175, h: 170, door: 'sports', hours: 'Daily, 6:00 AM – 9:00 PM', description: 'Cricket ground, indoor courts, gym and athletics track.', facilities: ['Cricket ground', 'Basketball & badminton', 'Gymnasium', 'Athletics track'] },
  { id: 'mess', name: 'Mess & Food Court', short: 'Mess', category: 'food', x: 790, y: 350, w: 175, h: 105, door: 'mess', hours: 'Daily, 7:30 AM – 9:30 PM', description: 'Central dining hall serving four meals a day, plus food court outlets.', facilities: ['Dining hall', 'Food court', 'Juice bar', 'Feedback kiosk'] },
  { id: 'research', name: 'Research & Innovation Centre', short: 'Research', category: 'academic', x: 790, y: 475, w: 175, h: 85, door: 'research', hours: 'Mon–Fri, 9:00 AM – 7:00 PM', description: 'Incubation centre, advanced research labs and maker space.', facilities: ['Incubation centre', 'Maker space', '3D printing'] },
  { id: 'medical', name: 'Medical Centre', short: 'Medical', category: 'health', x: 95, y: 360, w: 110, h: 80, door: 'med', hours: 'Open 24 hours', description: 'Doctor on call, first aid, pharmacy and ambulance service.', facilities: ['Doctor on call', 'Pharmacy', 'Ambulance', 'Counselling'] },
  { id: 'parking', name: 'Parking Area', short: 'Parking', category: 'facility', x: 95, y: 465, w: 110, h: 70, door: 'park', hours: 'Open 24 hours', description: 'Two-wheeler and four-wheeler parking for students, staff and visitors.', facilities: ['Two-wheeler bays', 'Car parking', 'EV charging'] },
  { id: 'boys', name: 'Boys Hostel', short: 'Boys Hostel', category: 'hostel', x: 285, y: 575, w: 180, h: 100, door: 'boys', hours: 'In-time: 10:00 PM', description: 'Residential blocks A–D with common rooms and laundry.', facilities: ['Common room', 'Laundry', 'Gym', 'Wi-Fi'] },
  { id: 'girls', name: 'Girls Hostel', short: 'Girls Hostel', category: 'hostel', x: 535, y: 575, w: 180, h: 100, door: 'girls', hours: 'In-time: 9:30 PM', description: 'Residential blocks with 24×7 warden support and common areas.', facilities: ['Common room', 'Laundry', 'Reading room', 'Wi-Fi'] },
]

const distance = (a: string, b: string) => {
  const [x1, y1] = nodes[a]
  const [x2, y2] = nodes[b]
  return Math.hypot(x2 - x1, y2 - y1)
}

const graph: Record<string, { to: string; weight: number }[]> = {}
for (const road of roads) {
  road.slice(1).forEach((node, index) => {
    const prev = road[index]
    const weight = distance(prev, node)
    ;(graph[prev] ??= []).push({ to: node, weight })
    ;(graph[node] ??= []).push({ to: prev, weight })
  })
}

/** Shortest path between two road nodes. Returns node ids and the length in map units. */
export const shortestPath = (from: string, to: string) => {
  const dist: Record<string, number> = { [from]: 0 }
  const prev: Record<string, string> = {}
  const pending = new Set(Object.keys(graph))

  while (pending.size) {
    let current: string | undefined
    for (const node of pending) {
      if (dist[node] !== undefined && (current === undefined || dist[node] < dist[current])) current = node
    }
    if (current === undefined || current === to) break
    pending.delete(current)
    for (const { to: next, weight } of graph[current]) {
      const candidate = dist[current] + weight
      if (dist[next] === undefined || candidate < dist[next]) {
        dist[next] = candidate
        prev[next] = current
      }
    }
  }

  if (dist[to] === undefined) return null
  const path = [to]
  while (path[0] !== from) path.unshift(prev[path[0]])
  return { path, length: dist[to] }
}

/** Approximate metres per map unit, used for walking estimates. */
export const METRES_PER_UNIT = 1.4
export const WALKING_METRES_PER_MINUTE = 80
