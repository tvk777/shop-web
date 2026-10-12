import axios, { isAxiosError } from 'axios'
import { queryClient } from './queryClient'
import { clearToken, getToken } from './tokenStorage'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
})

// On these endpoints a 401 means "wrong credentials", not "session expired".
const AUTH_ENDPOINTS = ['/login', '/signup']

api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      isAxiosError(error) &&
      error.response?.status === 401 &&
      !AUTH_ENDPOINTS.includes(error.config?.url ?? '')
    ) {
      // Clearing the token makes the user null; RequireAuth then redirects to /login.
      clearToken()
      queryClient.clear()
    }
    return Promise.reject(error)
  },
)
