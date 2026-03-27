'use server'

// app/actions/auth.ts
// 認証関連のServer Actions（ログアウト、パスワード変更）
// ※ ログインはAPI routeを維持（Cookie設定が必要なため）

import { changePassword, validatePasswordStrength } from '@/lib/auth'
import { getAuthUser, isAdmin } from '@/lib/server-action-auth'

// 共通レスポンス型
type ActionResponse<T = unknown> = {
  success: boolean
  data?: T
  error?: { message: string }
}

// パスワード変更
export async function changePasswordAction(
  newPassword: string,
  employeeNumber?: string
): Promise<ActionResponse<{ message: string }>> {
  try {
    const user = await getAuthUser()
    if (!user) {
      return { success: false, error: { message: '認証が必要です' } }
    }

    // 管理者/開発者はリクエストの employee_number を使用可能
    // 一般従業員は自分自身の employee_number のみ使用
    const targetEmployeeNumber = isAdmin(user)
      ? (employeeNumber || user.employee_number)
      : user.employee_number

    // 入力検証
    if (!targetEmployeeNumber || !newPassword) {
      return { success: false, error: { message: '従業員番号と新しいパスワードを入力してください' } }
    }

    // パスワード強度チェック
    const strength = validatePasswordStrength(newPassword)
    if (!strength.isValid) {
      return { success: false, error: { message: strength.errors.join('、') } }
    }

    // パスワード変更処理
    await changePassword(targetEmployeeNumber, newPassword)

    return { success: true, data: { message: 'パスワードを変更しました' } }
  } catch (error: unknown) {
    console.error('Change password error:', error)
    return { success: false, error: { message: 'パスワード変更に失敗しました' } }
  }
}
