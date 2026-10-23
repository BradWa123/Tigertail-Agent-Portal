'use client'
import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { api, clearToken, getToken, setToken, type AgentUser } from '@/lib/api'

interface Auth {
  user: AgentUser | null
  loading: boolean
  signIn: (token: string, user: AgentUser) => void
  signOut: () => Promise<void>
}

const AuthContext = createContext<Auth | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AgentUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!getToken()) { setLoading(false); return }
    api.get<{ user: AgentUser }>('/auth/me')
      .then(r => setUser(r.user))
      .catch(() => clearToken())
      .finally(() => setLoading(false))
  }, [])

  const signIn = useCallback((token: string, u: AgentUser) => { setToken(token); setUser(u) }, [])

  const signOut = useCallback(async () => {
    try { await api.post('/auth/logout') } catch {}
    clearToken(); setUser(null)
    window.location.replace('/')
  }, [])

  return <AuthContext.Provider value={{ user, loading, signIn, signOut }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
