import { createContext } from 'react'
import type { SignupRequest, User } from '@/api/types'

export interface AuthContextValue {
  user: User | null
  isAdmin: boolean
  // True while a stored token is being checked with GET /profile.
  isLoading: boolean
  // Set when the stored token could not be checked because of a non-401 error
  // (network, 5xx). The token is kept; null otherwise.
  sessionError: unknown
  // Runs the session restore (GET /profile) again.
  retrySession: () => void
  login: (email: string, password: string) => Promise<User>
  signup: (data: SignupRequest) => Promise<User>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
