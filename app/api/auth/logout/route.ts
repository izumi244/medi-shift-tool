// app/api/auth/logout/route.ts
// ログアウトAPI（セッション無効化 + cookie削除）

import { NextRequest, NextResponse } from 'next/server'
import { logout } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // cookieからセッショントークンを取得
    const sessionToken = request.cookies.get('session_token')?.value

    // DBのセッショントークンを無効化
    if (sessionToken) {
      await logout(sessionToken)
    }

    const response = NextResponse.json({ success: true })

    // cookieを削除
    response.cookies.set('session_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0
    })

    return response
  } catch (error: unknown) {
    console.error('ログアウトエラー:', error)
    // エラーでもcookieは削除する
    const response = NextResponse.json({ success: true })
    response.cookies.set('session_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0
    })
    return response
  }
}
