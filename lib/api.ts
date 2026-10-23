const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3002'
const TOKEN_KEY = 'ttl-agent-token'

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  try { return localStorage.getItem(TOKEN_KEY) } catch { return null }
}
export function setToken(t: string) { localStorage.setItem(TOKEN_KEY, t) }
export function clearToken() { try { localStorage.removeItem(TOKEN_KEY) } catch {} }

async function req<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const res = await fetch(`${BASE}/v1/agent${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'X-Agent-Token': token } : {}),
      ...options.headers,
    },
  })
  // Expired or revoked session — back to sign in
  if (res.status === 401 && token && typeof window !== 'undefined') {
    clearToken()
    if (window.location.pathname !== '/') window.location.replace('/')
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? `HTTP ${res.status}`)
  }
  return res.json()
}

export const api = {
  get:   <T>(path: string) => req<T>(path),
  post:  <T>(path: string, body?: unknown) => req<T>(path, { method: 'POST',  body: JSON.stringify(body ?? {}) }),
  put:   <T>(path: string, body?: unknown) => req<T>(path, { method: 'PUT',   body: JSON.stringify(body ?? {}) }),
  patch: <T>(path: string, body?: unknown) => req<T>(path, { method: 'PATCH', body: JSON.stringify(body ?? {}) }),
}

export interface AgentUser {
  id: string; name: string; email: string
  agent: { id: string; name: string }
}
