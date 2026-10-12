import { createContext } from 'react'
import type { SignupRequest, User } from '@/api/types'

export interface AuthContextValue {
  user: User | null
  isAdmin: boolean
  // True while a stored token is being checked with GET /profile.
  isLoading: boolean
  login: (email: string, password: string) => Promise<User>
  signup: (data: SignupRequest) => Promise<User>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
