// app/api/auth/login/route.ts
// ログインAPI

import { NextRequest, NextResponse } from 'next/server'
import { authenticate } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, password, remember_me } = body

    // 入力検証
    if (!user_id || !password) {
      return NextResponse.json(
        { success: false, error: { message: 'ユーザーIDとパスワードを入力してください' } },
        { status: 400 }
      )
    }

    // 認証処理
    const user = await authenticate({ user_id, password, remember_me })

    if (!user) {
      return NextResponse.json(
        { success: false, error: { message: 'ユーザーIDまたはパスワードが正しくありません' } },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      data: user
    })
  } catch (error: any) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, error: { message: error.message || 'ログインに失敗しました' } },
      { status: 500 }
    )
  }
}
