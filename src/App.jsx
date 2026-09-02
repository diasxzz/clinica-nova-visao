import { AuthProvider, useAuth } from './AuthContext.jsx'
import { useEffect, useState } from 'react'
import Navbar from './components/Navbar.jsx'
import PatientsPage from './pages/PatientsPage.jsx'
import ConsultationPage from './pages/ConsultationPage.jsx'
import ReceptionPage from './pages/ReceptionPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import TeamPage from './pages/TeamPage.jsx'
import { canAccessPage, defaultPageForRole, usesDesktopShell } from './roles.js'

function AppShell() {
  const { session, isLoading, isAdmin, role } = useAuth()
  const [currentPage, setCurrentPage] = useState('consultation')

  useEffect(() => {
    if (!role) {
      return
    }

    if (!canAccessPage(role, currentPage)) {
      setCurrentPage(defaultPageForRole(role))
    }
  }, [role, currentPage])

  const desktop = usesDesktopShell(role)

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-slate-100 text-slate-500">
        Carregando...
      </div>
    )
  }

  if (!session) {
    return <LoginPage />
  }

  return (
    <div className={`min-h-dvh bg-slate-100 print:bg-white ${desktop ? 'desktop-shell' : 'mobile-shell'}`}>
      <Navbar currentPage={currentPage} onChangePage={setCurrentPage} />

      <main
        className={
          desktop
            ? 'w-full min-w-0 px-[clamp(1rem,3vw,2.5rem)] py-[clamp(1rem,2vw,1.75rem)] print:p-0'
            : 'mx-auto w-full max-w-md px-3 pb-28 pt-3 print:max-w-none print:p-0'
        }
      >
        {currentPage === 'patients' && canAccessPage(role, 'patients') && <PatientsPage />}
        {currentPage === 'consultation' && canAccessPage(role, 'consultation') && (
          <ConsultationPage />
        )}
        {currentPage === 'reception' && canAccessPage(role, 'reception') && <ReceptionPage />}
        {currentPage === 'team' && isAdmin && <TeamPage />}
      </main>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  )
}

export default App
