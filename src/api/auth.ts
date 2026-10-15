import type { AxiosResponse } from 'axios'
import { api } from '@/lib/api'
import type { AuthResult, LoginRequest, SignupRequest, UserResponse } from './types'

const BEARER_PREFIX = 'Bearer '

// Reads the JWT from an "Authorization: Bearer <token>" response header; null if absent.
export function readBearerToken(headers: AxiosResponse['headers']): string | null {
  const header: unknown = headers.authorization
  if (typeof header !== 'string' || !header.startsWith(BEARER_PREFIX)) return null
  return header.slice(BEARER_PREFIX.length)
}

function requireToken(response: AxiosResponse): string {
  const token = readBearerToken(response.headers)
  if (token === null) throw new Error('No token in the Authorization response header')
  return token
}

export async function login(data: LoginRequest): Promise<AuthResult> {
  const response = await api.post<UserResponse>('/login', { user: data })
  return { token: requireToken(response), user: response.data.user }
}

export async function signup(data: SignupRequest): Promise<AuthResult> {
  const response = await api.post<UserResponse>('/signup', { user: data })
  return { token: requireToken(response), user: response.data.user }
}

export async function logout(): Promise<void> {
  await api.delete('/logout')
}
