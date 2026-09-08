import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabaseClient.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined)
  const [profile, setProfile] = useState(undefined)

  async function loadProfile(userId) {
    if (!userId) {
      setProfile(null)
      return
    }

    const { data, error } = await supabase
      .from('staff')
      .select('username, role, store_id, must_change_password')
      .eq('user_id', userId)
      .maybeSingle()

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
  }

  async function refreshProfile() {
    await loadProfile(session?.user?.id)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null)
      loadProfile(data.session?.user?.id)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession ?? null)
      loadProfile(nextSession?.user?.id)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const value = {
    session,
    user: session?.user ?? null,
    profile,
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
