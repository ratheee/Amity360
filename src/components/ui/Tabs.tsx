interface TabsProps<T extends string> {
  tabs: { key: T; label: string; count?: number }[]
  active: T
  onChange: (key: T) => void
}

export function Tabs<T extends string>({ tabs, active, onChange }: TabsProps<T>) {
  return (
    <div className="tabs" role="tablist">
      {tabs.map(tab => (
        <button key={tab.key} role="tab" aria-selected={active === tab.key} className={active === tab.key ? 'active' : ''} onClick={() => onChange(tab.key)}>
          {tab.label}
          {tab.count !== undefined && <span className="tab-count">{tab.count}</span>}
        </button>
      ))}
    </div>
  )
}

/** Pill-style filter chips, e.g. for categories. */
export function Chips<T extends string>({ options, active, onChange }: { options: { key: T; label: string }[]; active: T; onChange: (key: T) => void }) {
  return (
    <div className="chips">
      {options.map(option => (
        <button key={option.key} className={active === option.key ? 'chip active' : 'chip'} onClick={() => onChange(option.key)} aria-pressed={active === option.key}>
          {option.label}
        </button>
      ))}
    </div>
  )
}
