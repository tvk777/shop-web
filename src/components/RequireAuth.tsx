import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from '@/hooks/useAuth'

export function RequireAuth() {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  // Wait for the session restore instead of redirecting a user who is in fact logged in.
  if (isLoading) return <p>Loading…</p>
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />
  return <Outlet />
}
