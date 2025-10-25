export type UserRole = 'admin' | 'employee' | 'developer'

export interface User {
  id: string
  user_id: string        // tanaka123 形式
  name: string
  role: UserRole
  created_at: string
  last_login?: string
}

export interface LoginCredentials {
  user_id: string
  password: string
  remember_me: boolean
}

export interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

export interface SessionData {
  user: User
  expires_at: number
  remember_me: boolean
}
