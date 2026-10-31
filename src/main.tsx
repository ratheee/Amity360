import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import './styles/global.css'
import './styles/components.css'
import './styles/pages.css'

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Unable to start Amity 360: root element was not found.')
}

createRoot(rootElement).render(
  <StrictMode>
    <ToastProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ToastProvider>
  </StrictMode>,
)
