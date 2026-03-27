// app/api/auth/change-password/route.ts
// パスワード変更API

import { NextRequest, NextResponse } from 'next/server'
import { changePassword } from '@/lib/auth'
import { authenticateRequest, isAdmin } from '@/lib/api-auth'

export async function POST(request: NextRequest) {
  try {
    const user = await authenticateRequest(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: { message: '認証が必要です' } },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { new_password } = body

    // 管理者/開発者はリクエストボディの employee_number を使用可能
    // 一般従業員は自分自身の employee_number のみ使用（リクエストボディの値は無視）
    const employee_number = isAdmin(user)
      ? (body.employee_number || user.employee_number)
      : user.employee_number

    // 入力検証
    if (!employee_number || !new_password) {
      return NextResponse.json(
        { success: false, error: { message: '従業員番号と新しいパスワードを入力してください' } },
        { status: 400 }
      )
    }

    // パスワード変更処理
    await changePassword(employee_number, new_password)

    return NextResponse.json({
      success: true,
      data: { message: 'パスワードを変更しました' }
    })
  } catch (error: unknown) {
    console.error('Change password error:', error)
    return NextResponse.json(
      { success: false, error: { message: 'パスワード変更に失敗しました' } },
      { status: 500 }
    )
  }
}
