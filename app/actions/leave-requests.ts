'use server'

// app/actions/leave-requests.ts
// 希望休申請のCRUD Server Actions（ロールベースアクセス制御付き）

import { createServerSupabaseClient } from '@/lib/supabase'
import { LeaveRequest } from '@/types'
import { getAuthUser, isAdmin } from '@/lib/server-action-auth'

// 共通レスポンス型
type ActionResponse<T = unknown> = {
  success: boolean
  data?: T
  error?: { message: string }
}

// GET: 全希望休申請の取得
// Admin/developer: 全データ返却
// Employee: leave_typeを自分のリクエスト以外は'休み'に置換
export async function getLeaveRequests(): Promise<ActionResponse<LeaveRequest[]>> {
  try {
    const user = await getAuthUser()
    if (!user) {
      return { success: false, error: { message: '認証が必要です' } }
    }

    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase
      .from('leave_requests')
      .select('*')
      .order('date', { ascending: false })

    if (error) {
      console.error('Error fetching leave requests:', error)
      return { success: false, error: { message: '希望休データの処理に失敗しました' } }
    }

    let result = data as LeaveRequest[]

    // 一般従業員の場合、他人の詳細を非表示にする
    if (!isAdmin(user)) {
      result = result.map((req) => {
        if (req.employee_id !== user.id) {
          // 他人の申請: leave_typeを'休み'に置換、reasonとrejection_reasonを非表示
          return {
            ...req,
            leave_type: '休み' as LeaveRequest['leave_type'],
            reason: undefined,
            rejection_reason: undefined
          }
        }
        return req
      })
    }

    return { success: true, data: result }
  } catch (error: unknown) {
    console.error('Unexpected error in getLeaveRequests:', error)
    return { success: false, error: { message: '希望休データの処理中にエラーが発生しました' } }
  }
}

// POST: 新しい希望休申請の作成
// Admin/developer: 任意の従業員に対して作成可能
// Employee: 自分自身の申請のみ作成可能
export async function createLeaveRequest(
  leaveData: Omit<LeaveRequest, 'id' | 'created_at' | 'updated_at'>
): Promise<ActionResponse<LeaveRequest>> {
  try {
    const user = await getAuthUser()
    if (!user) {
      return { success: false, error: { message: '認証が必要です' } }
    }

    const body = leaveData as Record<string, unknown>

    // 必須フィールドのバリデーション
    if (!body.employee_id || !body.date || !body.leave_type) {
      return { success: false, error: { message: '従業員ID、日付、休暇種別は必須です' } }
    }

    // 一般従業員は自分自身の申請のみ作成可能
    if (!isAdmin(user) && body.employee_id !== user.id) {
      return { success: false, error: { message: '他の従業員の希望休を申請する権限がありません' } }
    }

    const supabase = createServerSupabaseClient()

    // 一般従業員はステータスを操作できない（常に'申請中'で作成）
    const status = isAdmin(user) ? (body.status || '申請中') : '申請中'

    const { data, error } = await supabase
      .from('leave_requests')
      .insert([
        {
          employee_id: body.employee_id,
          date: body.date,
          leave_type: body.leave_type,
          reason: body.reason,
          status
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('Error creating leave request:', error)
      return { success: false, error: { message: '希望休データの処理に失敗しました' } }
    }

    return { success: true, data: data as LeaveRequest }
  } catch (error: unknown) {
    console.error('Unexpected error in createLeaveRequest:', error)
    return { success: false, error: { message: '希望休データの処理中にエラーが発生しました' } }
  }
}

// PUT: 希望休申請の更新
// Admin/developer: 任意のリクエストを更新可能（承認・却下含む）
// Employee: 自分の申請のみ、かつステータスが'申請中'の場合のみ更新可能
export async function updateLeaveRequest(
  id: string,
  updates: Partial<LeaveRequest>
): Promise<ActionResponse<LeaveRequest>> {
  try {
    const user = await getAuthUser()
    if (!user) {
      return { success: false, error: { message: '認証が必要です' } }
    }

    if (!id) {
      return { success: false, error: { message: '希望休申請IDは必須です' } }
    }

    const supabase = createServerSupabaseClient()
    const body = updates as Record<string, unknown>

    // 一般従業員の場合、権限チェックを行う
    if (!isAdmin(user)) {
      // まず既存のリクエストを取得して所有者とステータスを確認
      const { data: existing, error: fetchError } = await supabase
        .from('leave_requests')
        .select('*')
        .eq('id', id)
        .single()

      if (fetchError || !existing) {
        return { success: false, error: { message: '希望休申請が見つかりません' } }
      }

      // 自分のリクエストでない場合は拒否
      if (existing.employee_id !== user.id) {
        return { success: false, error: { message: '他の従業員の希望休を更新する権限がありません' } }
      }

      // ステータスが'申請中'でない場合は拒否
      if (existing.status !== '申請中') {
        return { success: false, error: { message: '申請中の希望休のみ変更できます' } }
      }

      // 従業員がステータスを'承認'や'却下'に変更しようとした場合は拒否
      if (body.status && (body.status === '承認' || body.status === '却下')) {
        return { success: false, error: { message: '承認・却下の権限がありません' } }
      }
    }

    // システムフィールドとemployee_id（改ざん防止）を除外
    const { created_at, updated_at, id: _id, employee_id, ...updateData } = updates as Record<string, unknown>

    const { data, error } = await supabase
      .from('leave_requests')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating leave request:', error)
      return { success: false, error: { message: '希望休データの処理に失敗しました' } }
    }

    return { success: true, data: data as LeaveRequest }
  } catch (error: unknown) {
    console.error('Unexpected error in updateLeaveRequest:', error)
    return { success: false, error: { message: '希望休データの処理中にエラーが発生しました' } }
  }
}

// DELETE: 希望休申請の削除（物理削除）
// Admin/developer: 任意のリクエストを削除可能
// Employee: 自分の申請のみ、かつステータスが'申請中'の場合のみ削除可能
export async function deleteLeaveRequest(id: string): Promise<ActionResponse<{ id: string }>> {
  try {
    const user = await getAuthUser()
    if (!user) {
      return { success: false, error: { message: '認証が必要です' } }
    }

    if (!id) {
      return { success: false, error: { message: '希望休申請IDは必須です' } }
    }

    const supabase = createServerSupabaseClient()

    // 一般従業員の場合、権限チェックを行う
    if (!isAdmin(user)) {
      const { data: existing, error: fetchError } = await supabase
        .from('leave_requests')
        .select('*')
        .eq('id', id)
        .single()

      if (fetchError || !existing) {
        return { success: false, error: { message: '希望休申請が見つかりません' } }
      }

      // 自分のリクエストでない場合は拒否
      if (existing.employee_id !== user.id) {
        return { success: false, error: { message: '他の従業員の希望休を削除する権限がありません' } }
      }

      // ステータスが'申請中'でない場合は拒否
      if (existing.status !== '申請中') {
        return { success: false, error: { message: '申請中の希望休のみ削除できます' } }
      }
    }

    const { error } = await supabase
      .from('leave_requests')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting leave request:', error)
      return { success: false, error: { message: '希望休データの処理に失敗しました' } }
    }

    return { success: true, data: { id } }
  } catch (error: unknown) {
    console.error('Unexpected error in deleteLeaveRequest:', error)
    return { success: false, error: { message: '希望休データの処理中にエラーが発生しました' } }
  }
}
