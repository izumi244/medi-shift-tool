'use server'

// app/actions/employees.ts
// 従業員のCRUD Server Actions

import { createServerSupabaseClient } from '@/lib/supabase'
import { Employee, EmployeeAccountInfo } from '@/types'
import { createEmployeeAccount, resetEmployeePassword } from '@/lib/auth'
import { getAuthUser, requireAdmin, isAdmin } from '@/lib/server-action-auth'

// 共通レスポンス型
type ActionResponse<T = unknown> = {
  success: boolean
  data?: T
  error?: { message: string }
}

// GET: 全従業員の取得
export async function getEmployees(): Promise<ActionResponse<Employee[]>> {
  try {
    const user = await getAuthUser()
    if (!user) {
      return { success: false, error: { message: '認証が必要です' } }
    }

    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('is_active', true)
      .order('order_index', { ascending: true })
      .order('created_at', { ascending: false })

    if (error) {
      console.error('従業員取得エラー:', error)
      return { success: false, error: { message: '従業員データの取得に失敗しました' } }
    }

    // 機密フィールドを除外してレスポンスを返す
    const sanitizedData = (data as Employee[]).map(({ password_hash, session_token, ...safe }) => safe)

    // 一般従業員の場合、他の従業員の個人情報も制限
    let result = sanitizedData
    if (!isAdmin(user)) {
      result = sanitizedData.map((emp) => {
        if (emp.id !== user.id) {
          // 他の従業員のメール・電話・メモは非表示
          const { email, phone, notes, ...publicInfo } = emp
          return publicInfo
        }
        return emp
      })
    }

    return { success: true, data: result as Employee[] }
  } catch (error: unknown) {
    console.error('従業員取得の予期しないエラー:', error)
    return { success: false, error: { message: '従業員データの取得中にエラーが発生しました' } }
  }
}

// POST: 新しい従業員の作成（アカウント自動作成）
export async function createEmployee(
  employeeData: Omit<Employee, 'id' | 'created_at' | 'updated_at'>
): Promise<ActionResponse<{ employee: Employee; accountInfo: EmployeeAccountInfo }>> {
  try {
    const user = await requireAdmin()
    if (!user) {
      return { success: false, error: { message: '認証が必要です。管理者権限が必要です' } }
    }

    const body = employeeData as Record<string, unknown>

    // 必須フィールドのバリデーション
    if (!body.name || !body.employment_type || !body.job_type) {
      return { success: false, error: { message: '氏名、雇用形態、職種は必須です' } }
    }

    const supabase = createServerSupabaseClient()

    // 現在の最大order_indexを取得
    const { data: maxOrderData } = await supabase
      .from('employees')
      .select('order_index')
      .order('order_index', { ascending: false })
      .limit(1)
      .single()

    const nextOrderIndex = (maxOrderData?.order_index ?? 0) + 1

    // createEmployeeAccount関数を使用してアカウント作成
    const accountInfo = await createEmployeeAccount({
      name: body.name as string,
      employment_type: body.employment_type as string,
      job_type: body.job_type as string,
      max_days_per_week: (body.max_days_per_week as number) || 5,
      max_hours_per_month: (body.max_hours_per_month as number) || 160
    })

    // アカウント作成後、追加のフィールドを更新（order_indexも設定）
    const { data: updatedEmployee, error: updateError } = await supabase
      .from('employees')
      .update({
        assignable_workplaces_by_day: body.assignable_workplaces_by_day || {},
        assignable_shift_pattern_ids: body.assignable_shift_pattern_ids || [],
        day_constraints: body.day_constraints || [],
        available_days: body.available_days || [],
        phone: body.phone,
        email: body.email,
        notes: body.notes,
        order_index: nextOrderIndex
      })
      .eq('id', accountInfo.employee_id)
      .select()
      .single()

    if (updateError || !updatedEmployee) {
      console.error('従業員フィールド更新エラー:', updateError)
      // 更新に失敗しても、アカウント自体は作成済みなので基本情報を返す
      return {
        success: true,
        data: {
          employee: { id: accountInfo.employee_id, name: body.name as string } as Employee,
          accountInfo: accountInfo as EmployeeAccountInfo
        }
      }
    }

    // 機密フィールドを除外
    const { password_hash: _ph, session_token: _st, ...safeEmployee } = (updatedEmployee as Employee & { password_hash?: string; session_token?: string })
    return {
      success: true,
      data: {
        employee: safeEmployee as Employee,
        accountInfo: accountInfo as EmployeeAccountInfo
      }
    }
  } catch (error: unknown) {
    console.error('従業員作成の予期しないエラー:', error)
    return { success: false, error: { message: '従業員の作成中にエラーが発生しました' } }
  }
}

// PUT: 従業員の更新
export async function updateEmployee(
  id: string,
  updates: Partial<Employee>
): Promise<ActionResponse<Employee>> {
  try {
    const user = await requireAdmin()
    if (!user) {
      return { success: false, error: { message: '認証が必要です。管理者権限が必要です' } }
    }

    if (!id) {
      return { success: false, error: { message: '従業員IDは必須です' } }
    }

    const supabase = createServerSupabaseClient()

    // 機密フィールド・システムフィールド・権限フィールドを除外
    const { created_at, updated_at, id: _id, password_hash, session_token, is_system_account, role, ...updateData } = updates as Record<string, unknown>

    const { data, error } = await supabase
      .from('employees')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('従業員更新エラー:', error)
      return { success: false, error: { message: '従業員の更新に失敗しました' } }
    }

    // 機密フィールドを除外
    const { password_hash: _ph, session_token: _st, ...safeData } = (data as Employee & { password_hash?: string; session_token?: string })
    return { success: true, data: safeData as Employee }
  } catch (error: unknown) {
    console.error('従業員更新の予期しないエラー:', error)
    return { success: false, error: { message: '従業員の更新中にエラーが発生しました' } }
  }
}

// DELETE: 従業員の削除（物理削除）
export async function deleteEmployee(id: string): Promise<ActionResponse<{ id: string }>> {
  try {
    const user = await requireAdmin()
    if (!user) {
      return { success: false, error: { message: '認証が必要です。管理者権限が必要です' } }
    }

    if (!id) {
      return { success: false, error: { message: '従業員IDは必須です' } }
    }

    const supabase = createServerSupabaseClient()

    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('従業員削除エラー:', error)
      return { success: false, error: { message: '従業員の削除に失敗しました' } }
    }

    return { success: true, data: { id } }
  } catch (error: unknown) {
    console.error('従業員削除の予期しないエラー:', error)
    return { success: false, error: { message: '従業員の削除中にエラーが発生しました' } }
  }
}

// PATCH: 従業員の並び順を更新
export async function reorderEmployee(
  employeeId: string,
  direction: 'up' | 'down'
): Promise<ActionResponse<{ message: string }>> {
  try {
    const user = await requireAdmin()
    if (!user) {
      return { success: false, error: { message: '認証が必要です。管理者権限が必要です' } }
    }

    if (!employeeId || !direction) {
      return { success: false, error: { message: '従業員IDと方向は必須です' } }
    }

    if (direction !== 'up' && direction !== 'down') {
      return { success: false, error: { message: '方向は「up」または「down」である必要があります' } }
    }

    const supabase = createServerSupabaseClient()

    // 全従業員を取得（order_index順）
    const { data: employees, error: fetchError } = await supabase
      .from('employees')
      .select('id, order_index')
      .eq('is_active', true)
      .order('order_index', { ascending: true })
      .order('created_at', { ascending: false })

    if (fetchError) throw fetchError

    // 対象従業員のインデックスを取得
    const currentIndex = employees.findIndex((emp: { id: string; order_index: number }) => emp.id === employeeId)
    if (currentIndex === -1) {
      return { success: false, error: { message: '従業員が見つかりません' } }
    }

    // 移動先のインデックス
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1

    // 範囲外チェック
    if (targetIndex < 0 || targetIndex >= employees.length) {
      return { success: false, error: { message: 'これ以上移動できません' } }
    }

    // 入れ替え
    const currentEmployee = employees[currentIndex]
    const targetEmployee = employees[targetIndex]

    const tempOrder = currentEmployee.order_index
    currentEmployee.order_index = targetEmployee.order_index
    targetEmployee.order_index = tempOrder

    // 2件の更新を実行
    const { error: updateError1 } = await supabase
      .from('employees')
      .update({ order_index: currentEmployee.order_index })
      .eq('id', currentEmployee.id)

    if (updateError1) throw updateError1

    const { error: updateError2 } = await supabase
      .from('employees')
      .update({ order_index: targetEmployee.order_index })
      .eq('id', targetEmployee.id)

    if (updateError2) throw updateError2

    return { success: true, data: { message: '並び順を更新しました' } }
  } catch (error: unknown) {
    console.error('従業員並び替えの予期しないエラー:', error)
    return { success: false, error: { message: '従業員の並び替え中にエラーが発生しました' } }
  }
}

// パスワードリセット（管理者専用）
export async function resetPassword(
  employeeNumber: string
): Promise<ActionResponse<{ employee_number: string; new_password: string }>> {
  try {
    const user = await requireAdmin()
    if (!user) {
      return { success: false, error: { message: '管理者権限が必要です' } }
    }

    if (!employeeNumber) {
      return { success: false, error: { message: '従業員番号は必須です' } }
    }

    const result = await resetEmployeePassword(employeeNumber)

    return {
      success: true,
      data: {
        employee_number: result.employee_number,
        new_password: result.new_password
      }
    }
  } catch (error: unknown) {
    console.error('パスワードリセットの予期しないエラー:', error)
    return { success: false, error: { message: 'パスワードリセット中にエラーが発生しました' } }
  }
}
