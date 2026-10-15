import { api } from '@/lib/api'
import { setToken } from '@/lib/tokenStorage'
import { readBearerToken } from './auth'
import type { UpdateProfileRequest, User } from './types'

// GET /profile returns the user object itself (no { user } wrapper).
export async function getProfile(): Promise<User> {
  const response = await api.get<User>('/profile')
  return response.data
}

// PATCH /profile also returns the bare user.
// A password change rotates the JWT: the new one comes in the Authorization header and every
// older token stops working. It is stored here, before the hook's onSuccess or any other
// request runs, so nothing goes out with the old token.
export async function updateProfile(data: UpdateProfileRequest): Promise<User> {
  const response = await api.patch<User>('/profile', { user: data })
  const token = readBearerToken(response.headers)
  if (token !== null) setToken(token)
  return response.data
}
