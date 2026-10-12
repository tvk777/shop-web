import { Navigate, Outlet, useLocation, type Location } from 'react-router'
import { useAuth } from '@/hooks/useAuth'

// For /login and /signup: a logged-in user goes back to where RequireAuth sent them from.
export function RedirectIfAuthenticated() {
  const { user, isLoading } = useAuth()
  const location = useLocation()
  const from = (location.state as { from?: Location } | null)?.from

  if (isLoading) return <p>Loading…</p>
  if (user) return <Navigate to={from ?? '/'} replace />
  return <Outlet />
}
