import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './components/Toast'
import { LandingLanguageProvider } from './context/LandingLanguageContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <LandingLanguageProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </LandingLanguageProvider>
      </ToastProvider>
    </BrowserRouter>
  </StrictMode>,
)
