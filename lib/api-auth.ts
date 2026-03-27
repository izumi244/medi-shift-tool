// lib/api-auth.ts
// API認証ミドルウェア - リクエストからセッショントークンを抽出し検証する

import { NextRequest } from 'next/server'
import { verifySession } from '@/lib/auth'

/**
 * APIリクエストを認証する
 * Authorization ヘッダーまたはクッキーからセッショントークンを抽出し、
 * verifySessionで検証してユーザー情報を返す
 *
 * @param request - NextRequest オブジェクト
 * @returns 認証されたユーザー情報、または null（認証失敗時）
 */
export async function authenticateRequest(request: NextRequest) {
  try {
    // 1. Authorization ヘッダーからトークンを取得 (Bearer token)
    const authHeader = request.headers.get('Authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      if (token) {
        const user = await verifySession(token)
        if (user) return user
      }
    }

    // 2. クッキーからトークンを取得（フォールバック）
    const cookieToken = request.cookies.get('session_token')?.value
    if (cookieToken) {
      const user = await verifySession(cookieToken)
      if (user) return user
    }

    return null
  } catch (error) {
    console.error('API認証エラー:', error)
    return null
  }
}
