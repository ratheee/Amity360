import type { ReactNode } from 'react'
import { CircleAlert, LibraryBig, Map, Megaphone, UtensilsCrossed } from 'lucide-react'

const highlights = [
  { icon: UtensilsCrossed, text: 'Rate meals and see what’s on the mess menu' },
  { icon: Map, text: 'Find any building with walking directions' },
  { icon: LibraryBig, text: 'Notes, past papers and assignment submissions' },
  { icon: CircleAlert, text: 'Raise complaints and track them to resolution' },
  { icon: Megaphone, text: 'Never miss an announcement or campus event' },
]

/** Two-column shell for login and registration: brand panel on the left, form on the right. */
export function AuthLayout({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="auth-shell">
      <aside className="auth-brand">
        <div className="brand">
          <div className="brand-mark">A<span>360</span></div>
          <div><strong>AMITY</strong><small>UNIVERSITY RAJASTHAN</small></div>
        </div>
        <div className="auth-pitch">
          <span className="eyebrow">AMITY 360 · SMART CAMPUS</span>
          <h1>Your whole campus, in one place.</h1>
          <ul>
            {highlights.map(({ icon: Icon, text }) => <li key={text}><Icon />{text}</li>)}
          </ul>
        </div>
        <small className="auth-foot">Amity University Rajasthan, Jaipur</small>
      </aside>
      <main className="auth-main">
        <div className="auth-card">
          <div className="auth-mobile-brand brand">
            <div className="brand-mark">A<span>360</span></div>
            <div><strong>AMITY 360</strong><small>UNIVERSITY RAJASTHAN</small></div>
          </div>
          <h2>{title}</h2>
          <p className="auth-subtitle">{subtitle}</p>
          {children}
        </div>
      </main>
    </div>
  )
}
