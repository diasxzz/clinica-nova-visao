import ThemeToggle from './ThemeToggle.jsx'
import ClinicLogo from './ClinicLogo.jsx'
import ClinicMark from './ClinicMark.jsx'
import { STORES } from '../stores.js'

function AuthScreen({ title, subtitle, children, footer }) {
  return (
    <div className="auth-screen relative min-h-dvh bg-[#eef2f6] dark:bg-[#07111f]">
      <div className="absolute right-4 top-4 z-20 pt-[env(safe-area-inset-top)]">
        <ThemeToggle className="border-slate-300/80 bg-white/80 dark:border-slate-600 dark:bg-slate-900/80" />
      </div>

      <div className="grid min-h-dvh lg:grid-cols-[minmax(17rem,42%)_1fr]">
        <aside className="relative flex flex-col justify-between overflow-hidden bg-[#0c2340] px-6 py-8 text-white sm:px-8 lg:px-12 lg:py-14">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                'repeating-linear-gradient(0deg, #fff 0, #fff 1px, transparent 1px, transparent 28px)',
            }}
          />
          <ClinicMark className="pointer-events-none absolute -bottom-6 -right-4 h-32 w-32 opacity-[0.12] lg:h-44 lg:w-44" />

          <div className="relative z-10 flex items-center gap-4 lg:block">
            <div className="shrink-0 border border-white/20 bg-white px-3 py-2 lg:mb-8 lg:inline-block lg:px-4 lg:py-3">
              <ClinicLogo className="h-12 w-auto lg:h-20" />
            </div>
            <div>
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.35em] text-teal-200/90 lg:mb-2 lg:text-[11px]">
                Clínica Nova Visão
              </p>
              <h1 className="max-w-xs text-lg font-semibold leading-snug tracking-tight lg:text-[1.75rem] lg:leading-tight">
                Saúde visual com atendimento humano
              </h1>
            </div>
          </div>

          <div className="relative z-10 mt-10 hidden lg:block">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-teal-200/80">
              Unidades
            </p>
            <ul className="space-y-1.5 text-sm text-white/85">
              {STORES.map((store) => (
                <li key={store.id} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 shrink-0 bg-teal-400" />
                  {store.name}
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <main className="flex items-center justify-center px-5 py-10 pt-16 lg:px-10 lg:py-14 lg:pt-14">
          <div className="auth-panel w-full max-w-md border-2 border-[#0c2340] bg-white px-6 py-8 dark:border-teal-900 dark:bg-[#0b1524] sm:px-8 sm:py-10">
            <div className="mb-7 border-b border-[#0c2340]/20 pb-5 dark:border-teal-800/60">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.28em] text-teal-800 dark:text-teal-300">
                Acesso restrito
              </p>
              <h2 className="text-xl font-semibold text-[#0c2340] dark:text-slate-100">{title}</h2>
              {subtitle ? (
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  {subtitle}
                </p>
              ) : null}
            </div>

            {children}

            {footer ? (
              <p className="mt-6 border-t border-slate-200 pt-4 text-center text-[11px] text-slate-500 dark:border-slate-700 dark:text-slate-400">
                {footer}
              </p>
            ) : null}
          </div>
        </main>
      </div>
    </div>
  )
}

export const authLabelClass =
  'mb-1 block text-xs font-bold uppercase tracking-[0.14em] text-[#0c2340] dark:text-slate-300'

export const authInputClass =
  'mb-5 w-full border-0 border-b-2 border-[#0c2340]/30 bg-transparent px-0 py-2.5 text-base text-slate-900 outline-none placeholder:text-slate-400 focus:border-teal-600 dark:border-slate-600 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-teal-400'

export const authButtonClass =
  'min-h-12 w-full border-2 border-[#0c2340] bg-[#0c2340] px-4 py-3 text-sm font-bold uppercase tracking-[0.12em] text-white transition hover:bg-[#134e4a] hover:border-[#134e4a] disabled:opacity-60 dark:border-teal-700 dark:bg-teal-900 dark:hover:border-teal-600 dark:hover:bg-teal-800'

export const authAlertError =
  'mb-4 border-l-4 border-red-600 bg-red-50 px-3 py-2.5 text-sm text-red-800 dark:border-red-500 dark:bg-red-950/40 dark:text-red-200'

export const authAlertSuccess =
  'mb-4 border-l-4 border-teal-600 bg-teal-50 px-3 py-2.5 text-sm text-teal-900 dark:border-teal-500 dark:bg-teal-950/40 dark:text-teal-100'

export default AuthScreen
