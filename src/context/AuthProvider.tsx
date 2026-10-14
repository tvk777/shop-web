import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useMemo, useSyncExternalStore, type ReactNode } from 'react'
import * as authApi from '@/api/auth'
import { getProfile } from '@/api/profile'
import type { AuthResult, SignupRequest, User } from '@/api/types'
import { queryKeys } from '@/lib/queryKeys'
import { clearToken, getToken, setToken, subscribe } from '@/lib/tokenStorage'
import { AuthContext, type AuthContextValue } from './authContext'

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const token = useSyncExternalStore(subscribe, getToken)

  // Session restore: with a stored token, GET /profile tells who is logged in.
  // staleTime Infinity: no refetch on focus, so a later network blip can't log the user out.
  // Only a 401 ends the session (the axios interceptor clears the token); network and 5xx
  // errors keep the token and use the default retry, then surface as sessionError.
  const profileQuery = useQuery({
    queryKey: queryKeys.profile,
    queryFn: getProfile,
    enabled: token !== null,
    staleTime: Infinity,
  })

  // Only while no user is known yet: a failed refetch must not hide a user who is loaded.
  const restoring = token !== null && profileQuery.data === undefined
  const user = token !== null ? (profileQuery.data ?? null) : null
  // isFetching also covers a manual retry: refetch() keeps the status "error" while it runs.
  const isLoading = restoring && (profileQuery.isPending || profileQuery.isFetching)
  const sessionError = restoring && profileQuery.isError ? profileQuery.error : null

  const { refetch } = profileQuery
  const retrySession = useCallback(() => {
    void refetch()
  }, [refetch])

  const startSession = useCallback(
    ({ token, user }: AuthResult): User => {
      // Seed the profile before storing the token, so enabling the query doesn't refetch it.
      queryClient.setQueryData(queryKeys.profile, user)
      setToken(token)
      return user
    },
    [queryClient],
  )

  const login = useCallback(
    async (email: string, password: string) =>
      startSession(await authApi.login({ email, password })),
    [startSession],
  )

  const signup = useCallback(
    async (data: SignupRequest) => startSession(await authApi.signup(data)),
    [startSession],
  )

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } catch {
      // Ignored: the local logout below always happens, so there is nothing to report.
    }
    // Drop every cached query so the next user never sees this user's data.
    clearToken()
    queryClient.clear()
  }, [queryClient])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAdmin: user?.role === 'admin',
      isLoading,
      sessionError,
      retrySession,
      login,
      signup,
      logout,
    }),
    [user, isLoading, sessionError, retrySession, login, signup, logout],
  )

  return <AuthContext value={value}>{children}</AuthContext>
}
