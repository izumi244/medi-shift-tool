'use server'

// app/actions/leave-requests.ts
// 希望休申請のCRUD Server Actions（ロールベースアクセス制御付き）

import { createServerSupabaseClient } from '@/lib/supabase'
import { LeaveRequest, RequestStatus } from '@/types'
import { getAuthUser, isAdmin } from '@/lib/server-action-auth'
import { REQUEST_STATUS, LEAVE_TYPES_MASKED } from '@/lib/constants'

// 共通レスポンス型
type ActionResponse<T = unknown> = {
  success: boolean
  data?: T
  error?: { message: string }
}

// フィルターオプション型
export type LeaveRequestFilters = {
  status?: RequestStatus
  month?: string // 'YYYY-MM' 形式
  employee_id?: string
}

// GET: 希望休申請の取得（サーバーサイドフィルタリング対応）
// Admin/developer: 全データ返却
// Employee: leave_typeを自分のリクエスト以外は'休み'に置換
export async function getLeaveRequests(
  filters?: LeaveRequestFilters
): Promise<ActionResponse<LeaveRequest[]>> {
  try {
    const user = await getAuthUser()
    if (!user) {
      return { success: false, error: { message: '認証が必要です' } }
    }

    const supabase = createServerSupabaseClient()

    let query = supabase
      .from('leave_requests')
      .select('*')

    // ステータスフィルタ（サーバーサイド）
    if (filters?.status) {
      query = query.eq('status', filters.status)
    }

    // 月別フィルタ（サーバーサイド: 日付範囲で絞り込み）
    if (filters?.month) {
      const [year, month] = filters.month.split('-').map(Number)
      if (year && month && month >= 1 && month <= 12) {
        const startDate = `${year}-${String(month).padStart(2, '0')}-01`
        // 月末日を計算（翌月の0日目 = 当月末日）
        const lastDay = new Date(year, month, 0).getDate()
        const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
        query = query.gte('date', startDate).lte('date', endDate)
      }
    }

    // 従業員IDフィルタ（サーバーサイド）
    if (filters?.employee_id) {
      query = query.eq('employee_id', filters.employee_id)
    }

    // 一般従業員は自分のデータのみサーバーサイドで絞り込む場合もあるが、
    // カレンダー表示のため他人の休みも見える必要があるので、全データ取得後にマスクする
    const { data, error } = await query.order('date', { ascending: false })

    if (error) {
      console.error('希望休取得エラー:', error)
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
            leave_type: LEAVE_TYPES_MASKED as LeaveRequest['leave_type'],
            reason: undefined,
            rejection_reason: undefined
          }
        }
        return req
      })
    }

    return { success: true, data: result }
  } catch (error: unknown) {
    console.error('希望休取得の予期しないエラー:', error)
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

    // 日付形式のバリデーション
    const dateStr = body.date as string
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return { success: false, error: { message: '日付の形式が不正です（YYYY-MM-DD）' } }
    }

    // 一般従業員は自分自身の申請のみ作成可能
    if (!isAdmin(user) && body.employee_id !== user.id) {
      return { success: false, error: { message: '他の従業員の希望休を申請する権限がありません' } }
    }

    const supabase = createServerSupabaseClient()

    // 重複申請チェック: 同じ従業員・同じ日付で既に有効な申請（申請中 or 承認）がないか確認
    const { data: existingRequests, error: checkError } = await supabase
      .from('leave_requests')
      .select('id, status, leave_type')
      .eq('employee_id', body.employee_id)
      .eq('date', body.date)
      .in('status', [REQUEST_STATUS.PENDING, REQUEST_STATUS.APPROVED])

    if (checkError) {
      console.error('希望休重複チェックエラー:', checkError)
      return { success: false, error: { message: '重複チェック中にエラーが発生しました' } }
    }

    if (existingRequests && existingRequests.length > 0) {
      const existingStatus = existingRequests[0].status
      return {
        success: false,
        error: {
          message: `この日付には既に${existingStatus === REQUEST_STATUS.APPROVED ? '承認済み' : '申請中'}の希望休があります`
        }
      }
    }

    // 一般従業員はステータスを操作できない（常に申請中で作成）
    const status = isAdmin(user) ? (body.status || REQUEST_STATUS.PENDING) : REQUEST_STATUS.PENDING

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
      console.error('希望休作成エラー:', error)
      return { success: false, error: { message: '希望休データの処理に失敗しました' } }
    }

    return { success: true, data: data as LeaveRequest }
  } catch (error: unknown) {
    console.error('希望休作成の予期しないエラー:', error)
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

    // 既存リクエストを取得（Admin/Employee共通で必要）
    const { data: existing, error: fetchError } = await supabase
      .from('leave_requests')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !existing) {
      return { success: false, error: { message: '希望休申請が見つかりません' } }
    }

    // 一般従業員の場合、権限チェックを行う
    if (!isAdmin(user)) {
      // 自分のリクエストでない場合は拒否
      if (existing.employee_id !== user.id) {
        return { success: false, error: { message: '他の従業員の希望休を更新する権限がありません' } }
      }

      // ステータスが申請中でない場合は拒否
      if (existing.status !== REQUEST_STATUS.PENDING) {
        return { success: false, error: { message: '申請中の希望休のみ変更できます' } }
      }

      // 従業員がステータスを承認や却下に変更しようとした場合は拒否
      if (body.status && (body.status === REQUEST_STATUS.APPROVED || body.status === REQUEST_STATUS.REJECTED)) {
        return { success: false, error: { message: '承認・却下の権限がありません' } }
      }
    }

    // Admin承認時: approved_by と approved_at を自動設定
    if (isAdmin(user) && body.status === REQUEST_STATUS.APPROVED && existing.status !== REQUEST_STATUS.APPROVED) {
      body.approved_by = user.id
      body.approved_at = new Date().toISOString()
    }

    // システムフィールドとemployee_id（改ざん防止）を除外
    const { created_at, updated_at, id: _id, employee_id, ...updateData } = body

    const { data, error } = await supabase
      .from('leave_requests')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('希望休更新エラー:', error)
      return { success: false, error: { message: '希望休データの処理に失敗しました' } }
    }

    return { success: true, data: data as LeaveRequest }
  } catch (error: unknown) {
    console.error('希望休更新の予期しないエラー:', error)
    return { success: false, error: { message: '希望休データの処理中にエラーが発生しました' } }
  }
}

// DELETE: 希望休申請の削除（物理削除）
// Admin/developer: 任意のリクエストを削除可能（承認済みの場合はシフト影響チェック付き）
// Employee: 自分の申請のみ、かつステータスが'申請中'の場合のみ削除可能
export async function deleteLeaveRequest(
  id: string,
  force?: boolean
): Promise<ActionResponse<{ id: string; warning?: string }>> {
  try {
    const user = await getAuthUser()
    if (!user) {
      return { success: false, error: { message: '認証が必要です' } }
    }

    if (!id) {
      return { success: false, error: { message: '希望休申請IDは必須です' } }
    }

    const supabase = createServerSupabaseClient()

    // 全ユーザーで既存データを取得（削除前チェック用）
    const { data: existing, error: fetchError } = await supabase
      .from('leave_requests')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !existing) {
      return { success: false, error: { message: '希望休申請が見つかりません' } }
    }

    // 一般従業員の場合、権限チェックを行う
    if (!isAdmin(user)) {
      // 自分のリクエストでない場合は拒否
      if (existing.employee_id !== user.id) {
        return { success: false, error: { message: '他の従業員の希望休を削除する権限がありません' } }
      }

      // ステータスが申請中でない場合は拒否
      if (existing.status !== REQUEST_STATUS.PENDING) {
        return { success: false, error: { message: '申請中の希望休のみ削除できます' } }
      }
    }

    // Admin: 承認済みの休暇を削除する場合、シフトへの影響をチェック
    let warning: string | undefined
    if (isAdmin(user) && existing.status === REQUEST_STATUS.APPROVED) {
      const { data: relatedShifts, error: shiftError } = await supabase
        .from('shifts')
        .select('id, date, status')
        .eq('employee_id', existing.employee_id)
        .eq('date', existing.date)
        .eq('is_rest', true)

      if (!shiftError && relatedShifts && relatedShifts.length > 0) {
        if (!force) {
          return {
            success: false,
            error: {
              message: `この承認済み休暇に対応するシフト（休み）が${relatedShifts.length}件存在します。削除するとシフトとの整合性が失われます。強制削除するにはforceオプションを使用してください。`
            }
          }
        }
        warning = `承認済み休暇を削除しました。関連するシフト（休み）が${relatedShifts.length}件あります。シフトの手動更新が必要な場合があります。`
      }
    }

    const { error } = await supabase
      .from('leave_requests')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('希望休削除エラー:', error)
      return { success: false, error: { message: '希望休データの処理に失敗しました' } }
    }

    return { success: true, data: { id, warning } }
  } catch (error: unknown) {
    console.error('希望休削除の予期しないエラー:', error)
    return { success: false, error: { message: '希望休データの処理中にエラーが発生しました' } }
  }
}
