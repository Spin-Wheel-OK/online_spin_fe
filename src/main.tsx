import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { LanguageProvider } from './i18n/LanguageContext'
import './index.css'
import App from './App.tsx'
import AdminPanel from './components/AdminPanel.tsx'
import AdminAuth from './components/AdminAuth.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route
            path="/admin-mm"
            element={
              <AdminAuth>
                <AdminPanel />
              </AdminAuth>
            }
          />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  </StrictMode>,
)
