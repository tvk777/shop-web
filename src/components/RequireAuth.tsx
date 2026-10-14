import type { ReactNode } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router'
import { LoadingState } from '@/components/LoadingState'
import { OfflineBanner } from '@/components/OfflineBanner'
import { SessionErrorState } from '@/components/SessionErrorState'
import { useAuth } from '@/hooks/useAuth'

// No AppLayout yet (its header needs the user), so repeat its banner and container.
// Offline at startup the restore query is paused, and the banner explains the wait.
function FullPage({ children }: { children: ReactNode }) {
  return (
    <>
      <OfflineBanner />
      <div className="mx-auto max-w-5xl px-4 py-6">{children}</div>
    </>
  )
}

export function RequireAuth() {
  const { user, isLoading, sessionError } = useAuth()
  const location = useLocation()

  // Wait for the session restore instead of redirecting a user who is in fact logged in.
  if (isLoading) {
    return (
      <FullPage>
        <LoadingState />
      </FullPage>
    )
  }
  // The API could not confirm the token (network, 5xx): keep it instead of sending to /login.
  if (sessionError) {
    return (
      <FullPage>
        <SessionErrorState />
      </FullPage>
    )
  }
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />
  return <Outlet />
}
