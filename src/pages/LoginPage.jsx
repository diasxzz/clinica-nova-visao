import { useEffect, useState } from 'react'
import ClinicLogo from '../components/ClinicLogo.jsx'
import ThemeToggle from '../components/ThemeToggle.jsx'
import { supabase } from '../supabaseClient.js'
import { staffEmail } from '../staffAuth.js'
import { alertError, alertSuccess, inputClass, labelClass, pageTitle } from '../uiClasses.js'

function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState('login')
  const [errorMessage, setErrorMessage] = useState('')
  const [infoMessage, setInfoMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    supabase.rpc('has_coordinator').then(({ data, error }) => {
      if (error) {
        console.error(error)
        return
      }

      const hasAdmin = Boolean(data)
      if (!hasAdmin) {
        setMode('bootstrap')
      }
    })
  }, [])

  async function handleSubmit(event) {
    event.preventDefault()
    setErrorMessage('')
    setInfoMessage('')
    setIsSubmitting(true)

    const cleanUser = username.trim().toLowerCase()

    try {
      if (mode === 'bootstrap') {
        const { data, error } = await supabase.functions.invoke('bootstrap-admin', {
          body: { username: cleanUser, password },
        })

        if (error) {
          throw new Error(data?.error || error.message)
        }

        if (data?.error) {
          throw new Error(data.error)
        }

        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: staffEmail(cleanUser),
          password,
        })

        if (signInError) {
          throw signInError
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: staffEmail(cleanUser),
          password,
        })

        if (error) {
          throw error
        }
      }
    } catch (error) {
      setErrorMessage(error.message || 'Não foi possível entrar.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center bg-slate-100 px-4 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] dark:bg-slate-950">
      <div className="absolute right-4 top-4 pt-[env(safe-area-inset-top)]">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-sm dark:bg-slate-900 dark:ring-1 dark:ring-slate-800 dark:shadow-none">
        <ClinicLogo className="mx-auto mb-4 h-20 w-auto" />
        <h1 className={`${pageTitle} mb-1 text-center`}>
          {mode === 'bootstrap' ? 'Criar acesso do coordenador' : 'Entrar'}
        </h1>
        <p className="mb-5 text-center text-sm text-slate-500 dark:text-slate-400">
          {mode === 'bootstrap'
            ? 'Primeiro acesso geral. Sem e-mail, só usuário e senha.'
            : 'Use o usuário e a senha da sua localidade.'}
        </p>

        {errorMessage && <p className={`${alertError} mb-3`}>{errorMessage}</p>}

        {infoMessage && <p className={`${alertSuccess} mb-3`}>{infoMessage}</p>}

        <form onSubmit={handleSubmit}>
          <label htmlFor="username" className={labelClass}>
            Usuário
          </label>
          <input
            id="username"
            type="text"
            autoComplete="username"
            autoCapitalize="none"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="ex: coordenacao"
            required
            minLength={3}
            className={`${inputClass} mb-3`}
          />

          <label htmlFor="password" className={labelClass}>
            Senha
          </label>
          <input
            id="password"
            type="password"
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={6}
            className={`${inputClass} mb-5`}
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="min-h-12 w-full rounded-xl bg-teal-600 px-4 py-3 font-medium text-white disabled:opacity-60"
          >
            {isSubmitting ? 'Aguarde...' : mode === 'bootstrap' ? 'Criar acesso' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default LoginPage
