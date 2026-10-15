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
  password_confirmation: string
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

// Price arrives as a string ("12.9"). description is optional in the backend.
export interface Item {
  id: number
  name: string
  description: string | null
  price: string
}

// Money values (price, amount) arrive as strings. The server calculates both.
export interface OrderLine {
  item_id: number
  name: string
  price: string
  quantity: number
}

export interface Order {
  id: number
  amount: string
  created_at: string
  items: OrderLine[]
}

// Body of PATCH /profile. Two separate shapes, so the data form needs a password
// (current_password) only for an email change, and role can never be sent.
export type UpdateProfileRequest =
  | { first_name: string; last_name: string; email: string; current_password?: string }
  | { current_password: string; password: string; password_confirmation: string }

// A row of GET /admin/users. orders_count is only sent by the admin list.
export interface AdminUser extends User {
  orders_count: number
}

// Body of PATCH /admin/users/:id. Passwords are not editable here.
export interface AdminUserUpdate {
  first_name: string
  last_name: string
  email: string
  role: Role
}

// Body of POST /admin/items and PATCH /admin/items/:id. price is sent as a string too.
export interface ItemInput {
  name: string
  description: string
  price: string
}
