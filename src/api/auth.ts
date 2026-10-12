import type { AxiosResponse } from 'axios'
import { api } from '@/lib/api'
import type { AuthResult, LoginRequest, SignupRequest, UserResponse } from './types'

const BEARER_PREFIX = 'Bearer '

function readToken(response: AxiosResponse): string {
  const header: unknown = response.headers.authorization
  if (typeof header !== 'string' || !header.startsWith(BEARER_PREFIX)) {
    throw new Error('No token in the Authorization response header')
  }
  return header.slice(BEARER_PREFIX.length)
}

export async function login(data: LoginRequest): Promise<AuthResult> {
  const response = await api.post<UserResponse>('/login', { user: data })
  return { token: readToken(response), user: response.data.user }
}

export async function signup(data: SignupRequest): Promise<AuthResult> {
  const response = await api.post<UserResponse>('/signup', { user: data })
  return { token: readToken(response), user: response.data.user }
}

export async function logout(): Promise<void> {
  await api.delete('/logout')
}
