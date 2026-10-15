import { Navigate, Outlet, useLocation, type Location } from 'react-router'
import { LoadingState } from '@/components/LoadingState'
import { SessionErrorState } from '@/components/SessionErrorState'
import { useAuth } from '@/hooks/useAuth'
import { homePath, USER_ONLY_PATHS } from '@/lib/routes'

// For /login and /signup: a logged-in user goes back to where RequireAuth sent them from,
// otherwise to their home page. An admin is never sent back to a user-only page.
export function RedirectIfAuthenticated() {
  const { user, isAdmin, isLoading, sessionError } = useAuth()
  const location = useLocation()
  const from = (location.state as { from?: Location } | null)?.from

  if (isLoading) return <LoadingState />
  // A stored token that couldn't be checked: don't offer the form, so nobody logs in again by mistake.
  if (sessionError) return <SessionErrorState />
  if (user) {
    const useFrom = from && !(isAdmin && USER_ONLY_PATHS.includes(from.pathname))
    return <Navigate to={useFrom ? from : homePath(isAdmin)} replace />
  }
  return <Outlet />
}
