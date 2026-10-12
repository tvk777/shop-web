import { api } from '@/lib/api'
import type { User } from './types'

// GET /profile returns the user object itself (no { user } wrapper).
export async function getProfile(): Promise<User> {
  const response = await api.get<User>('/profile')
  return response.data
}
