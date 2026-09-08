import { useEffect, useState } from 'react'
import AuthScreen, {
  authAlertError,
  authAlertSuccess,
  authButtonClass,
  authInputClass,
  authLabelClass,
} from '../components/AuthScreen.jsx'
import { supabase } from '../supabaseClient.js'
import { staffEmail } from '../staffAuth.js'

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
    <AuthScreen
      title={mode === 'bootstrap' ? 'Primeiro acesso' : 'Entrada da equipe'}
      subtitle={
        mode === 'bootstrap'
          ? 'Configure o usuário do coordenador. Depois disso, a equipe entra por aqui.'
          : 'Informe o usuário e a senha da sua localidade.'
      }
      footer="Uso exclusivo da equipe Clínica Nova Visão"
    >
      {errorMessage && <p className={authAlertError}>{errorMessage}</p>}
      {infoMessage && <p className={authAlertSuccess}>{infoMessage}</p>}

      <form onSubmit={handleSubmit}>
        <label htmlFor="username" className={authLabelClass}>
          Usuário
        </label>
        <input
          id="username"
          type="text"
          autoComplete="username"
          autoCapitalize="none"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          placeholder="coordenacao"
          required
          minLength={3}
          className={authInputClass}
        />

        <label htmlFor="password" className={authLabelClass}>
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
          className={authInputClass}
        />

        <button type="submit" disabled={isSubmitting} className={authButtonClass}>
          {isSubmitting ? 'Aguarde...' : mode === 'bootstrap' ? 'Criar acesso' : 'Entrar'}
        </button>
      </form>
    </AuthScreen>
  )
}

export default LoginPage
