import { Navigate, Outlet, useLocation, type Location } from 'react-router'
import { LoadingState } from '@/components/LoadingState'
import { SessionErrorState } from '@/components/SessionErrorState'
import { useAuth } from '@/hooks/useAuth'

// For /login and /signup: a logged-in user goes back to where RequireAuth sent them from.
export function RedirectIfAuthenticated() {
  const { user, isLoading, sessionError } = useAuth()
  const location = useLocation()
  const from = (location.state as { from?: Location } | null)?.from

  if (isLoading) return <LoadingState />
  // A stored token that couldn't be checked: don't offer the form, so nobody logs in again by mistake.
  if (sessionError) return <SessionErrorState />
  if (user) return <Navigate to={from ?? '/'} replace />
  return <Outlet />
}
