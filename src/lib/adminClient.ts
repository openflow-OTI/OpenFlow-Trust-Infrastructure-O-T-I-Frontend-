const baseUrl = import.meta.env.VITE_API_BASE_URL as string

export function getAdminSecret(): string {
  return sessionStorage.getItem('oti_admin_secret') ?? ''
}

export function setAdminSecret(secret: string) {
  sessionStorage.setItem('oti_admin_secret', secret)
}

export function clearAdminSecret() {
  sessionStorage.removeItem('oti_admin_secret')
}

/** Callback set by Admin.tsx to auto-lock the UI on a 401. */
let onUnauthorized: (() => void) | null = null

export function registerUnauthorizedHandler(fn: () => void) {
  onUnauthorized = fn
}

export async function adminFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const secret = getAdminSecret()
  const res = await fetch(`${baseUrl}/api${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'x-admin-secret': secret,
      ...(options.headers ?? {}),
    },
  })

  if (res.status === 401) {
    clearAdminSecret()
    onUnauthorized?.()
    throw new Error('Unauthorized — session cleared.')
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`)
  }

  const text = await res.text()
  return (text ? JSON.parse(text) : {}) as T
}

/** Probe the backend to validate a candidate secret. Returns true if accepted. */
export async function probeAdminSecret(candidate: string): Promise<boolean> {
  try {
    const res = await fetch(`${baseUrl}/api/admin/stats`, {
      headers: { 'x-admin-secret': candidate },
    })
    return res.status === 200
  } catch {
    return false
  }
}
