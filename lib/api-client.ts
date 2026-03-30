// lib/api-client.ts
// 認証付きfetchラッパー - フロントエンドからAPI呼び出し時にセッショントークンを自動付与

import { getSessionToken } from '@/lib/session'

/**
 * 認証ヘッダー付きのfetchラッパー
 * セッショントークンをAuthorizationヘッダーに自動的に付与する
 */
export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const sessionToken = getSessionToken()

  const headers = new Headers(options.headers || {})

  if (sessionToken) {
    headers.set('Authorization', `Bearer ${sessionToken}`)
  }

  return fetch(url, {
    ...options,
    headers,
  })
}
