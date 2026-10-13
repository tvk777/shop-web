import { api } from '@/lib/api'
import type { UpdateProfileRequest, User } from './types'

// GET /profile returns the user object itself (no { user } wrapper).
export async function getProfile(): Promise<User> {
  const response = await api.get<User>('/profile')
  return response.data
}

// PATCH /profile also returns the bare user.
export async function updateProfile(data: UpdateProfileRequest): Promise<User> {
  const response = await api.patch<User>('/profile', { user: data })
  return response.data
}
