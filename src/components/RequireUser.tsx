import { Navigate, Outlet } from 'react-router'
import { useAuth } from '@/hooks/useAuth'

// Catalog, cart and orders are for regular users; the API answers 403 to admins on /orders.
// Used inside RequireAuth, so the session is already restored here.
export function RequireUser() {
  const { isAdmin } = useAuth()
  if (isAdmin) return <Navigate to="/admin" replace />
  return <Outlet />
}
