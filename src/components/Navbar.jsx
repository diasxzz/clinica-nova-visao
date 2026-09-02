import ClinicLogo from './ClinicLogo.jsx'
import { useAuth } from '../AuthContext.jsx'
import { tabsForRole, usesDesktopShell } from '../roles.js'

function Navbar({ currentPage, onChangePage }) {
  const { signOut, role } = useAuth()
  const tabs = tabsForRole(role)
  const desktop = usesDesktopShell(role)

  if (desktop) {
    return (
      <header className="no-print sticky top-0 z-30 border-b border-slate-200 bg-white">
        <div className="flex w-full items-center gap-[clamp(0.75rem,2vw,1.5rem)] px-[clamp(1rem,3vw,2.5rem)] py-[clamp(0.5rem,1.2vw,0.9rem)]">
          <ClinicLogo className="h-[clamp(2.75rem,4.5vw,3.5rem)] w-auto" />
          <nav className="flex min-w-0 flex-1 flex-wrap items-center gap-1">
            {tabs.map((tab) => {
              const isActive = currentPage === tab.id

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onChangePage(tab.id)}
                  className={
                    isActive
                      ? 'rounded-lg bg-teal-50 px-[clamp(0.75rem,1.5vw,1.25rem)] py-[clamp(0.4rem,0.9vw,0.65rem)] text-[clamp(0.85rem,1.1vw,1rem)] font-semibold text-teal-800'
                      : 'rounded-lg px-[clamp(0.75rem,1.5vw,1.25rem)] py-[clamp(0.4rem,0.9vw,0.65rem)] text-[clamp(0.85rem,1.1vw,1rem)] font-medium text-slate-600 hover:bg-slate-50'
                  }
                >
                  {tab.label}
                </button>
              )
            })}
          </nav>
          <button
            type="button"
            onClick={() => signOut()}
            className="shrink-0 text-[clamp(0.8rem,1vw,0.95rem)] font-medium text-slate-500 hover:text-slate-800"
          >
            Sair
          </button>
        </div>
      </header>
    )
  }

  return (
    <>
      <header className="no-print sticky top-0 z-30 border-b border-slate-200 bg-white/95 pt-[env(safe-area-inset-top)] backdrop-blur">
        <div className="relative flex items-center justify-center px-3 py-2">
          <ClinicLogo className="h-12 w-auto" />
          <button
            type="button"
            onClick={() => signOut()}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-500"
          >
            Sair
          </button>
        </div>
      </header>

      <nav className="no-print fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto grid max-w-lg grid-cols-1">
          {tabs.map((tab) => {
            const isActive = currentPage === tab.id

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onChangePage(tab.id)}
                className={
                  isActive
                    ? 'min-h-14 border-t-2 border-teal-600 px-2 py-3 text-sm font-semibold text-teal-700'
                    : 'min-h-14 border-t-2 border-transparent px-2 py-3 text-sm font-medium text-slate-500'
                }
              >
                {tab.label}
              </button>
            )
          })}
        </div>
      </nav>
    </>
  )
}

export default Navbar
