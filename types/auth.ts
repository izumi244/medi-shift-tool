export type UserRole = 'admin' | 'employee' | 'developer'

export interface User {
  id: string
  user_id: string        // tanaka123 形式 (ログイン時に使用)
  employee_number: string // emp001 形式 (従業員番号)
  name: string
  role: UserRole
  password_changed: boolean // パスワード変更済みフラグ
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
