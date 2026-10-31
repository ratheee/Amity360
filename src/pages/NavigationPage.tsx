import { useMemo, useState } from 'react'
import { Clock, Footprints, MapPin, Navigation, Search, X } from 'lucide-react'
import { buildings, categoryLabels, METRES_PER_UNIT, nodes, roads, shortestPath, WALKING_METRES_PER_MINUTE, type BuildingCategory } from '../data/campus'
import { Badge, Button, Chips, PageHeader, Panel } from '../components/ui'

type Filter = BuildingCategory | 'all'

const byId = (id: string) => buildings.find(item => item.id === id)!
const centre = (id: string): [number, number] => {
  const b = byId(id)
  return [b.x + b.w / 2, b.y + b.h / 2]
}

export function NavigationPage() {
  const [selected, setSelected] = useState<string | null>(null)
  const [from, setFrom] = useState('gate')
  const [to, setTo] = useState('')
  const [term, setTerm] = useState('')
  const [filter, setFilter] = useState<Filter>('all')

  const visible = buildings.filter(item => (filter === 'all' || item.category === filter) && item.name.toLowerCase().includes(term.trim().toLowerCase()))
  const visibleIds = new Set(visible.map(item => item.id))

  const route = useMemo(() => {
    if (!to || from === to) return null
    const result = shortestPath(byId(from).door, byId(to).door)
    if (!result) return null
    const points = [centre(from), ...result.path.map(id => nodes[id]), centre(to)]
    const metres = Math.round(result.length * METRES_PER_UNIT / 10) * 10 + 20
    return { points, metres, minutes: Math.max(1, Math.round(metres / WALKING_METRES_PER_MINUTE)) }
  }, [from, to])

  const info = selected ? byId(selected) : null
  const categories = Object.keys(categoryLabels) as BuildingCategory[]

  const directTo = (id: string) => {
    setTo(id)
    if (id === from) setFrom(id === 'gate' ? 'admin' : 'gate')
  }

  return (
    <>
      <PageHeader module="navigation" subtitle="Explore the campus, look up building details and get walking directions." />

      <div className="nav-layout">
        <Panel className="map-panel">
          <div className="map-toolbar">
            <div className="search small-search">
              <Search />
              <input placeholder="Find a building…" value={term} onChange={event => setTerm(event.target.value)} aria-label="Find a building" />
              {term && <button onClick={() => setTerm('')} aria-label="Clear"><X /></button>}
            </div>
            <Chips options={[{ key: 'all' as Filter, label: 'All' }, ...categories.map(key => ({ key: key as Filter, label: categoryLabels[key] }))]} active={filter} onChange={setFilter} />
          </div>
          <div className="map-scroll">
            <svg viewBox="0 0 1000 700" className="campus-map" role="img" aria-label="Illustrative campus map">
              <rect x="0" y="0" width="1000" height="700" rx="14" className="map-ground" />
              <rect x="95" y="110" width="110" height="70" rx="12" className="map-green" />
              <rect x="40" y="565" width="200" height="110" rx="12" className="map-green" />
              <text x="140" y="625" textAnchor="middle" className="map-label">Green Belt</text>
              {roads.map((road, index) => (
                <polyline key={index} points={road.map(id => nodes[id].join(',')).join(' ')} className="map-road" />
              ))}
              {buildings.map(item => {
                const dim = !visibleIds.has(item.id)
                const classes = ['map-building', `cat-${item.category}`, selected === item.id && 'selected', (item.id === from || item.id === to) && route && 'endpoint', dim && 'dim'].filter(Boolean).join(' ')
                return (
                  <g
                    key={item.id}
                    className={classes}
                    onClick={() => setSelected(item.id)}
                    onKeyDown={event => (event.key === 'Enter' || event.key === ' ') && setSelected(item.id)}
                    tabIndex={0}
                    role="button"
                    aria-label={item.name}
                  >
                    <rect x={item.x} y={item.y} width={item.w} height={item.h} rx="8" />
                    <text x={item.x + item.w / 2} y={item.y + item.h / 2 + 5} textAnchor="middle">{item.short}</text>
                  </g>
                )
              })}
              {route && (
                <>
                  <polyline points={route.points.map(point => point.join(',')).join(' ')} className="map-route" />
                  <circle cx={route.points[0][0]} cy={route.points[0][1]} r="9" className="map-pin start" />
                  <circle cx={route.points.at(-1)![0]} cy={route.points.at(-1)![1]} r="9" className="map-pin end" />
                </>
              )}
            </svg>
          </div>
          <p className="muted small">Illustrative map for navigation within Amity 360. Tap a building for details.</p>
        </Panel>

        <div className="nav-side">
          <Panel eyebrow="DIRECTIONS" title="Plan a route">
            <div className="form-stack">
              <div className="field">
                <label htmlFor="from">From</label>
                <select id="from" className="input" value={from} onChange={event => setFrom(event.target.value)}>
                  {buildings.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
              </div>
              <div className="field">
                <label htmlFor="to">To</label>
                <select id="to" className="input" value={to} onChange={event => setTo(event.target.value)}>
                  <option value="">Choose destination…</option>
                  {buildings.filter(item => item.id !== from).map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
              </div>
              {route ? (
                <div className="route-summary">
                  <div><Footprints /><strong>{route.metres} m</strong><span>walking distance</span></div>
                  <div><Clock /><strong>{route.minutes} min</strong><span>approx. walk</span></div>
                </div>
              ) : <p className="muted small">Select a destination to draw the walking route on the map.</p>}
              {to && <Button variant="ghost" size="sm" onClick={() => setTo('')} icon={<X />}>Clear route</Button>}
            </div>
          </Panel>

          {info ? (
            <Panel eyebrow={categoryLabels[info.category].toUpperCase()} title={info.name} action={<button onClick={() => setSelected(null)} aria-label="Close details"><X size={16} /></button>}>
              <p className="building-desc">{info.description}</p>
              <p className="meta-line"><Clock size={15} /> {info.hours}</p>
              <div className="tag-list">{info.facilities.map(item => <Badge key={item} tone="blue">{item}</Badge>)}</div>
              <Button icon={<Navigation />} onClick={() => directTo(info.id)} className="btn-block">Get directions here</Button>
            </Panel>
          ) : (
            <Panel eyebrow="PLACES" title="Campus directory">
              <div className="place-list">
                {visible.map(item => (
                  <button key={item.id} onClick={() => setSelected(item.id)}>
                    <span className={`place-dot cat-${item.category}`} />
                    <span><strong>{item.name}</strong><small>{categoryLabels[item.category]}</small></span>
                    <MapPin size={15} />
                  </button>
                ))}
                {!visible.length && <p className="muted small">No buildings match your search.</p>}
              </div>
            </Panel>
          )}
        </div>
      </div>
    </>
  )
}
