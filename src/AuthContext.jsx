import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, supabaseConfigured } from './supabaseClient.js'

const AuthContext = createContext(null)
const AUTH_TIMEOUT_MS = 10000

export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined)
  const [profile, setProfile] = useState(undefined)
  const [authError, setAuthError] = useState('')

  async function loadProfile(userId) {
    if (!userId) {
      setProfile(null)
      return
    }

    try {
      let { data, error } = await supabase
        .from('staff')
        .select('username, role, store_id, must_change_password')
        .eq('user_id', userId)
        .maybeSingle()

      if (error?.code === '42703') {
        ;({ data, error } = await supabase
          .from('staff')
          .select('username, role, store_id')
          .eq('user_id', userId)
          .maybeSingle())
      }

      if (error) {
        console.error(error)
        setProfile(null)
        return
      }

      setProfile(
        data
          ? {
              username: data.username,
              role: data.role,
              storeId: data.store_id,
              mustChangePassword: Boolean(data.must_change_password),
              isAdmin: data.role === 'admin',
              isDoctor: data.role === 'doctor',
              isReception: data.role === 'reception',
            }
          : null,
      )
    } catch (error) {
      console.error(error)
      setProfile(null)
    }
  }

  async function refreshProfile() {
    await loadProfile(session?.user?.id)
  }

  useEffect(() => {
    let active = true

    async function initAuth() {
      if (!supabaseConfigured) {
        setAuthError('Supabase não configurado. Verifique o arquivo .env no servidor.')
        setSession(null)
        setProfile(null)
        return
      }

      try {
        const { data, error } = await supabase.auth.getSession()

        if (!active) {
          return
        }

        if (error) {
          throw error
        }

        const nextSession = data.session ?? null
        setSession(nextSession)
        await loadProfile(nextSession?.user?.id)
      } catch (error) {
        console.error(error)
        if (active) {
          setAuthError('Não foi possível conectar ao login. Recarregue a página.')
          setSession(null)
          setProfile(null)
        }
      }
    }

    const timeoutId = window.setTimeout(() => {
      if (!active) {
        return
      }

      setSession((current) => (current === undefined ? null : current))
      setProfile((current) => (current === undefined ? null : current))
      setAuthError((current) => current || 'A conexão demorou demais. Tente recarregar.')
    }, AUTH_TIMEOUT_MS)

    initAuth()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession ?? null)
      void loadProfile(nextSession?.user?.id)
    })

    return () => {
      active = false
      window.clearTimeout(timeoutId)
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
    isLoading: session === undefined || (session && profile === undefined),
    refreshProfile,
    signOut: () => supabase.auth.signOut(),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
