// app/api/auth/change-password/route.ts
// パスワード変更API

import { NextRequest, NextResponse } from 'next/server'
import { changePassword } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { employee_number, new_password } = body

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
      message: 'パスワードを変更しました'
    })
  } catch (error: any) {
    console.error('Change password error:', error)
    return NextResponse.json(
      { success: false, error: { message: error.message || 'パスワード変更に失敗しました' } },
      { status: 500 }
    )
  }
}
