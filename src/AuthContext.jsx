import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, supabaseConfigured } from './supabaseClient.js'

const AuthContext = createContext(null)
const AUTH_TIMEOUT_MS = 8000

function withTimeout(promise, ms, label) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      window.setTimeout(() => reject(new Error(label)), ms)
    }),
  ])
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined)
  const [profile, setProfile] = useState(undefined)
  const [authError, setAuthError] = useState('')

  async function loadProfile(userId) {
    if (!userId) {
      return null
    }

    let { data, error } = await supabase
      .from('staff')
      .select('username, role, store_id, must_change_password')
      .eq('user_id', userId)
      .maybeSingle()

    if (error) {
      ;({ data, error } = await supabase
        .from('staff')
        .select('username, role, store_id')
        .eq('user_id', userId)
        .maybeSingle())
    }

    if (error) {
      console.error(error)
      return null
    }

    if (!data) {
      return null
    }

    return {
      username: data.username,
      role: data.role,
      storeId: data.store_id,
      mustChangePassword: Boolean(data.must_change_password),
      isAdmin: data.role === 'admin',
      isDoctor: data.role === 'doctor',
      isReception: data.role === 'reception',
    }
  }

  async function refreshProfile() {
    const nextProfile = await loadProfile(session?.user?.id)
    setProfile(nextProfile)
  }

  useEffect(() => {
    let active = true

    async function bootstrap() {
      if (!supabaseConfigured) {
        if (!active) return
        setAuthError('Supabase não configurado. Rode o build com o arquivo .env do servidor.')
        setSession(null)
        setProfile(null)
        return
      }

      try {
        const { data, error } = await withTimeout(
          supabase.auth.getSession(),
          AUTH_TIMEOUT_MS,
          'auth-timeout',
        )

        if (!active) return

        if (error) {
          throw error
        }

        const nextSession = data.session ?? null
        setSession(nextSession)

        if (!nextSession?.user?.id) {
          setProfile(null)
          return
        }

        const nextProfile = await withTimeout(
          loadProfile(nextSession.user.id),
          AUTH_TIMEOUT_MS,
          'profile-timeout',
        )

        if (!active) return
        setProfile(nextProfile)
      } catch (error) {
        console.error(error)
        if (!active) return

        setSession(null)
        setProfile(null)
        setAuthError(
          error.message === 'auth-timeout' || error.message === 'profile-timeout'
            ? 'A conexão demorou demais. Recarregue a página.'
            : 'Não foi possível iniciar o sistema. Recarregue a página.',
        )
      }
    }

    bootstrap()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!active || event === 'INITIAL_SESSION') {
        return
      }

      const userId = nextSession?.user?.id
      setSession(nextSession ?? null)
      setAuthError('')

      if (!userId) {
        setProfile(null)
        return
      }

      void withTimeout(loadProfile(userId), AUTH_TIMEOUT_MS, 'profile-timeout')
        .then((nextProfile) => {
          if (active) {
            setProfile(nextProfile)
          }
        })
        .catch((error) => {
          console.error(error)
          if (active) {
            setProfile(null)
          }
        })
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  const value = {
    session,
    user: session?.user ?? null,
    profile,
    authError,
    isAdmin: Boolean(profile?.isAdmin),
    isDoctor: Boolean(profile?.isDoctor),
    isReception: Boolean(profile?.isReception),
    mustChangePassword: Boolean(profile?.mustChangePassword),
    role: profile?.role ?? null,
    isLoading: session === undefined || (Boolean(session) && profile === undefined),
    refreshProfile,
    signOut: () => supabase.auth.signOut(),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
