import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, supabaseConfigured } from './supabaseClient.js'

const AuthContext = createContext(null)
const AUTH_TIMEOUT_MS = 5000
const MAX_BOOT_MS = 3000

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      window.setTimeout(() => reject(new Error('timeout')), ms)
    }),
  ])
}

async function fetchProfile(userId) {
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

  if (error || !data) {
    console.error(error)
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

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [ready, setReady] = useState(false)
  const [authError, setAuthError] = useState('')

  async function refreshProfile() {
    const nextProfile = await fetchProfile(session?.user?.id)
    setProfile(nextProfile)
  }

  useEffect(() => {
    let active = true

    async function applySession(nextSession) {
      if (!active) {
        return
      }

      setSession(nextSession)
      setAuthError('')

      if (!nextSession?.user?.id) {
        setProfile(null)
        return
      }

      try {
        const nextProfile = await withTimeout(fetchProfile(nextSession.user.id), AUTH_TIMEOUT_MS)
        if (active) {
          setProfile(nextProfile)
        }
      } catch (error) {
        console.error(error)
        if (active) {
          setProfile(null)
          setAuthError('Não foi possível carregar seu perfil. Tente entrar de novo.')
        }
      }
    }

    async function bootstrap() {
      if (!supabaseConfigured) {
        if (!active) return
        setAuthError('Supabase não configurado no servidor. Refaça o build com o .env.')
        setSession(null)
        setProfile(null)
        setReady(true)
        return
      }

      try {
        const { data, error } = await withTimeout(supabase.auth.getSession(), AUTH_TIMEOUT_MS)

        if (!active) return

        if (error) {
          throw error
        }

        await applySession(data.session ?? null)
      } catch (error) {
        console.error(error)
        if (!active) return
        setSession(null)
        setProfile(null)
        setAuthError('Não foi possível conectar. Verifique a internet e recarregue.')
      } finally {
        if (active) {
          setReady(true)
        }
      }
    }

    const bootTimer = window.setTimeout(() => {
      if (active) {
        setReady(true)
      }
    }, MAX_BOOT_MS)

    bootstrap()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!active || event === 'INITIAL_SESSION') {
        return
      }

      void applySession(nextSession ?? null)
    })

    return () => {
      active = false
      window.clearTimeout(bootTimer)
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
    isLoading: !ready,
    refreshProfile,
    signOut: () => supabase.auth.signOut(),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
