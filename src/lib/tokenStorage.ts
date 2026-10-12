// JWT storage. The in-memory value is the source of truth, localStorage only persists it,
// so auth still works for the session if storage is blocked (private mode).
// subscribe() lets React (useSyncExternalStore) react to changes made outside components,
// e.g. by the 401 interceptor.
const STORAGE_KEY = 'shop.token'

const listeners = new Set<() => void>()

function readStoredToken(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

let token = readStoredToken()

function notify() {
  listeners.forEach((listener) => listener())
}

export function getToken(): string | null {
  return token
}

export function setToken(value: string) {
  token = value
  try {
    localStorage.setItem(STORAGE_KEY, value)
  } catch {
    // Storage unavailable: the token lives in memory until the page reloads.
  }
  notify()
}

export function clearToken() {
  if (token === null) return
  token = null
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Nothing to remove if storage is unavailable.
  }
  notify()
}

export function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
