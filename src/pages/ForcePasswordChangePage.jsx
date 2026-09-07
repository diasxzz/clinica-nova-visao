import { useState } from 'react'
import ClinicLogo from '../components/ClinicLogo.jsx'
import ThemeToggle from '../components/ThemeToggle.jsx'
import { supabase } from '../supabaseClient.js'
import { useAuth } from '../AuthContext.jsx'
import { alertError, inputClass, labelClass, pageSubtitle, pageTitle } from '../uiClasses.js'

function ForcePasswordChangePage() {
  const { profile, refreshProfile } = useAuth()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setErrorMessage('')

    if (password.length < 6) {
      setErrorMessage('A nova senha precisa ter no mínimo 6 caracteres.')
      return
    }

    if (password !== confirmPassword) {
      setErrorMessage('As senhas não coincidem.')
      return
    }

    setIsSubmitting(true)

    try {
      const { error: updateError } = await supabase.auth.updateUser({ password })

      if (updateError) {
        throw updateError
      }

      const { error: rpcError } = await supabase.rpc('complete_password_change')

      if (rpcError) {
        throw rpcError
      }

      await refreshProfile()
    } catch (error) {
      setErrorMessage(error.message || 'Não foi possível alterar a senha.')
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
        <h1 className={`${pageTitle} mb-1 text-center`}>Defina sua senha</h1>
        <p className={`${pageSubtitle} mb-5 text-center`}>
          Olá, {profile?.username}. No primeiro acesso, cadastre uma senha pessoal para continuar.
        </p>

        {errorMessage && <p className={`${alertError} mb-3`}>{errorMessage}</p>}

        <form onSubmit={handleSubmit}>
          <label htmlFor="new-password" className={labelClass}>
            Nova senha
          </label>
          <input
            id="new-password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={6}
            className={`${inputClass} mb-3`}
          />

          <label htmlFor="confirm-password" className={labelClass}>
            Confirmar senha
          </label>
          <input
            id="confirm-password"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
            minLength={6}
            className={`${inputClass} mb-5`}
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="min-h-12 w-full rounded-xl bg-teal-600 px-4 py-3 font-medium text-white disabled:opacity-60"
          >
            {isSubmitting ? 'Salvando...' : 'Salvar e continuar'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default ForcePasswordChangePage
