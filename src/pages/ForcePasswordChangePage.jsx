import { useState } from 'react'
import AuthScreen, {
  authAlertError,
  authButtonClass,
  authInputClass,
  authLabelClass,
} from '../components/AuthScreen.jsx'
import { supabase } from '../supabaseClient.js'
import { useAuth } from '../AuthContext.jsx'

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
    <AuthScreen
      title="Defina sua senha"
      subtitle={`Olá, ${profile?.username}. No primeiro acesso, cadastre uma senha pessoal para continuar.`}
      footer="Por segurança, troque a senha provisória agora"
    >
      {errorMessage && <p className={authAlertError}>{errorMessage}</p>}

      <form onSubmit={handleSubmit}>
        <label htmlFor="new-password" className={authLabelClass}>
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
          className={authInputClass}
        />

        <label htmlFor="confirm-password" className={authLabelClass}>
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
          className={authInputClass}
        />

        <button type="submit" disabled={isSubmitting} className={authButtonClass}>
          {isSubmitting ? 'Salvando...' : 'Salvar e continuar'}
        </button>
      </form>
    </AuthScreen>
  )
}

export default ForcePasswordChangePage
