// lib/server-action-auth.ts
// Server Action用の認証ヘルパー - cookies()を使用してセッショントークンを取得

import { cookies } from 'next/headers'
import { verifySession } from '@/lib/auth'
import type { UserRole } from '@/types/auth'

/**
 * Server Actionのユーザー情報型
 */
export interface AuthUser {
  id: string
  user_id: string
  employee_number: string
  name: string
  role: UserRole
  password_changed: boolean
  created_at: string
  last_login?: string
}

/**
 * ユーザーが管理者権限を持つかチェックする
 * admin または developer ロールを管理者とみなす
 */
export function isAdmin(user: { role: UserRole }): boolean {
  return user.role === 'admin' || user.role === 'developer'
}

/**
 * Server Action用の認証関数
 * cookies()からセッショントークンを取得し、verifySessionで検証する
 *
 * @returns 認証されたユーザー情報、または null（認証失敗時）
 */
export async function getAuthUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('session_token')?.value

    if (!sessionToken) {
      return null
    }

    const user = await verifySession(sessionToken)
    return user as AuthUser | null
  } catch (error) {
    console.error('Server Action認証エラー:', error)
    return null
  }
}

/**
 * 管理者権限を要求するServer Action用ヘルパー
 * 認証失敗または非管理者の場合はエラーレスポンスを返す
 *
 * @returns 管理者ユーザー情報、または null
 */
export async function requireAdmin(): Promise<AuthUser | null> {
  const user = await getAuthUser()
  if (!user) return null
  if (!isAdmin(user)) return null
  return user
}
