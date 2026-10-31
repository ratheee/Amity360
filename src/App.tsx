import { useEffect } from 'react'
import { ShieldAlert } from 'lucide-react'
import type { ModuleKey } from './types'
import { canAccess } from './data/modules'
import { useAuth } from './context/AuthContext'
import { useHashRoute } from './hooks/useHashRoute'
import { AppLayout } from './components/layout/AppLayout'
import { EmptyState, Spinner, Button } from './components/ui'
import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'
import { DashboardPage } from './pages/DashboardPage'
import { MessPage } from './pages/MessPage'
import { NavigationPage } from './pages/NavigationPage'
import { ResourcesPage } from './pages/ResourcesPage'
import { ComplaintsPage } from './pages/ComplaintsPage'
import { AnnouncementsPage } from './pages/AnnouncementsPage'
import { AdminPage } from './pages/admin/AdminPage'
import { ProfilePage } from './pages/ProfilePage'
import { ReviewDashboardPage } from './pages/review/ReviewDashboardPage'
import { PlannedModulePage } from './pages/review/PlannedModulePage'
import { REVIEW_MODE } from './config'

function App() {
  const { user, loading } = useAuth()
  const [route, navigate] = useHashRoute()
  const isAuthRoute = route === 'login' || route === 'register'

  // Signed-in users skip the auth screens; signed-out users are sent to login.
  useEffect(() => {
    if (loading) return
    if (user && isAuthRoute) navigate('dashboard')
    if (!user && !isAuthRoute) navigate('login')
  }, [user, loading, isAuthRoute, navigate])

  if (loading) return <div className="boot"><Spinner label="Starting Amity 360…" /></div>

  if (!user) {
    return route === 'register'
      ? <RegisterPage onLogin={() => navigate('login')} />
      : <LoginPage onRegister={() => navigate('register')} />
  }

  const module: ModuleKey = isAuthRoute ? 'dashboard' : route

  return (
    <AppLayout route={module} onNavigate={navigate}>
      {canAccess(module, user.role) ? renderPage(module, navigate) : (
        <EmptyState
          icon={<ShieldAlert />}
          title="Access restricted"
          message="This area is only available to administrators."
          action={<Button onClick={() => navigate('dashboard')}>Back to dashboard</Button>}
        />
      )}
    </AppLayout>
  )
}

function renderPage(module: ModuleKey, navigate: (key: ModuleKey) => void) {
  if (REVIEW_MODE) {
    if (module === 'dashboard') return <ReviewDashboardPage navigate={navigate} />
    if (module !== 'profile') return <PlannedModulePage module={module} />
  }
  switch (module) {
    case 'dashboard': return <DashboardPage navigate={navigate} />
    case 'mess': return <MessPage />
    case 'navigation': return <NavigationPage />
    case 'resources': return <ResourcesPage />
    case 'complaints': return <ComplaintsPage />
    case 'updates': return <AnnouncementsPage />
    case 'admin': return <AdminPage navigate={navigate} />
    case 'profile': return <ProfilePage />
  }
}

export default App
