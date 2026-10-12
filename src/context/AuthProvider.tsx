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
  const profileQuery = useQuery({
    queryKey: queryKeys.profile,
    queryFn: async () => {
      try {
        return await getProfile()
      } catch (error) {
        clearToken()
        throw error
      }
    },
    enabled: token !== null,
    staleTime: Infinity,
    retry: false,
  })

  const user = token !== null ? (profileQuery.data ?? null) : null
  const isLoading = token !== null && profileQuery.isPending

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
    } finally {
      // Log out locally even if the request fails, and drop every cached query
      // so the next user never sees this user's data.
      clearToken()
      queryClient.clear()
    }
  }, [queryClient])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAdmin: user?.role === 'admin',
      isLoading,
      login,
      signup,
      logout,
    }),
    [user, isLoading, login, signup, logout],
  )

  return <AuthContext value={value}>{children}</AuthContext>
}
