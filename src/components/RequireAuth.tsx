import { Navigate, Outlet, useLocation } from 'react-router'
import { LoadingState } from '@/components/LoadingState'
import { useAuth } from '@/hooks/useAuth'

export function RequireAuth() {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  // Wait for the session restore instead of redirecting a user who is in fact logged in.
  // No header yet (it needs the user), so use the same container as AppLayout.
  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-6">
        <LoadingState />
      </div>
    )
  }
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />
  return <Outlet />
}
