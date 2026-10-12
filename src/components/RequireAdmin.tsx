import { Navigate, Outlet } from 'react-router'
import { useAuth } from '@/hooks/useAuth'

// Used inside RequireAuth, so the session is already restored here.
export function RequireAdmin() {
  const { isAdmin } = useAuth()
  if (!isAdmin) return <Navigate to="/" replace />
  return <Outlet />
}
