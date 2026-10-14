import { useQueryClient } from '@tanstack/react-query'
import { ErrorState } from '@/components/ErrorState'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { clearToken } from '@/lib/tokenStorage'

// Shown by the route guards when a stored token could not be checked (network, 5xx).
export function SessionErrorState() {
  const { sessionError, retrySession } = useAuth()
  const queryClient = useQueryClient()

  // Local logout only: the API is unreachable, and the user must never be stuck here.
  const logOutLocally = () => {
    clearToken()
    queryClient.clear()
  }

  return (
    <ErrorState error={sessionError} onRetry={retrySession}>
      <Button variant="ghost" onClick={logOutLocally}>
        Log out
      </Button>
    </ErrorState>
  )
}
