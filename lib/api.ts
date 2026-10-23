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

export type AgentStatus = 'assigned' | 'accepted' | 'declined' | 'submitted' | 'confirmed'

export interface Booking {
  id: string; ref: string; status: string; agent_status: AgentStatus; agent_note: string | null
  agent_assigned_at: string; agent_accepted_at: string | null; agent_submitted_at: string | null; agent_confirmed_at: string | null
  customer_ref: string | null; incoterm: string | null
  shipper_name: string | null; shipper_addr: string | null; shipper_contact: string | null; shipper_phone: string | null; shipper_email: string | null
  cons_name: string | null; cons_addr: string | null; cons_contact: string | null; cons_phone: string | null; cons_email: string | null; cons_eori: string | null
  notify: string | null; commodity: string | null; hs: string | null; pkgs: number | null; pkg_type: string | null
  weight: number | null; cbm: number | null; dg: boolean; dg_info: string | null
  pickup_addr: string | null; etd_pref: string | null; instructions: string | null
  cbn: string | null; carrier: string | null; vessel: string | null; voyage: string | null
  etd: string | null; eta: string | null; si_cutoff: string | null; cy_cutoff: string | null; containers: string | null
  created_at: string
  pol: string; pod: string; equip: string; qty: number; ready: string | null
  rate_carrier: string | null; routing: string | null; transit: number | null
}
