import { useEffect, useState } from 'react'
import ClinicLogo from '../components/ClinicLogo.jsx'
import { supabase } from '../supabaseClient.js'
import { staffEmail } from '../staffAuth.js'

const fieldClass =
  'w-full min-h-12 rounded-xl border border-slate-200 px-3 py-3 text-base text-slate-800 outline-none placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100'

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
    <div className="flex min-h-dvh flex-col items-center justify-center bg-slate-100 px-4 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-sm">
        <ClinicLogo className="mx-auto mb-4 h-20 w-auto" />
        <h1 className="mb-1 text-center text-xl font-semibold text-slate-800">
          {mode === 'bootstrap' ? 'Criar acesso do coordenador' : 'Entrar'}
        </h1>
        <p className="mb-5 text-center text-sm text-slate-500">
          {mode === 'bootstrap'
            ? 'Primeiro acesso geral. Sem e-mail, só usuário e senha.'
            : 'Use o usuário e a senha da sua localidade.'}
        </p>

        {errorMessage && (
          <p className="mb-3 rounded-xl bg-red-50 px-3 py-3 text-sm text-red-700">
            {errorMessage}
          </p>
        )}

        {infoMessage && (
          <p className="mb-3 rounded-xl bg-teal-50 px-3 py-3 text-sm text-teal-800">
            {infoMessage}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <label htmlFor="username" className="mb-1 block text-sm font-medium text-slate-700">
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
            className={`${fieldClass} mb-3`}
          />

          <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">
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
            className={`${fieldClass} mb-5`}
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
