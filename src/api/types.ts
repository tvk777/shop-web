export type Role = 'user' | 'admin'

export interface User {
  id: number
  email: string
  first_name: string
  last_name: string
  role: Role
}

export interface LoginRequest {
  email: string
  password: string
}

export interface SignupRequest {
  first_name: string
  last_name: string
  email: string
  password: string
}

// Body of POST /login and POST /signup. The JWT comes in the Authorization header.
export interface UserResponse {
  user: User
}

export interface AuthResult {
  token: string
  user: User
}

// Body of 404 and 422 responses.
export interface ApiErrorResponse {
  errors: string[]
}
