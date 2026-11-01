import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import PrivacyPolicy from './livemerge/components/PrivacyPolicy.tsx'

const isPrivacyPage = window.location.pathname.replace(/\/+$/, '') === '/privacy'

createRoot(document.getElementById('root')!).render(
  <StrictMode>{isPrivacyPage ? <PrivacyPolicy /> : <App />}</StrictMode>
)
