'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User, AuthState, LoginCredentials } from '@/types/auth'
import { getSession, saveSession, createSession, clearSession } from '@/lib/session'

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false
  })

  useEffect(() => {
    const session = getSession()
    if (session) {
      setAuthState({
        user: session.user,
        isLoading: false,
        isAuthenticated: true
      })
    } else {
      setAuthState(prev => ({ ...prev, isLoading: false }))
    }
  }, [])

  const login = async (credentials: LoginCredentials) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }))

      // ログインAPIを呼び出し
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      })

      const result = await response.json()

      if (!result.success || !result.data) {
        throw new Error(result.error?.message || '認証に失敗しました')
      }

      const user = result.data.user as User
      const sessionToken = result.data.session_token as string
      const session = createSession(user, credentials.remember_me, sessionToken)
      saveSession(session)

      setAuthState({
        user,
        isLoading: false,
        isAuthenticated: true
      })
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }))
      throw error
    }
  }

  const handleLogout = async () => {
    // サーバー側のセッション無効化 + cookie削除
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch {
      // ネットワークエラーでもクライアント側はログアウトする
    }
    clearSession()
    setAuthState({
      user: null,
      isLoading: false,
      isAuthenticated: false
    })
  }

  return (
    <AuthContext.Provider value={{
      ...authState,
      login,
      logout: handleLogout
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
