'use server'

// app/actions/shifts.ts
// シフト割当のCRUD Server Actions

import { createServerSupabaseClient } from '@/lib/supabase'
import { Shift } from '@/types'
import { getAuthUser, requireAdmin, isAdmin } from '@/lib/server-action-auth'

// 共通レスポンス型
type ActionResponse<T = unknown> = {
  success: boolean
  data?: T
  error?: { message: string }
}

// GET: シフト割当の取得
export async function getShifts(options?: {
  startDate?: string
  endDate?: string
}): Promise<ActionResponse<Shift[]>> {
  try {
    const user = await getAuthUser()
    if (!user) {
      return { success: false, error: { message: '認証が必要です' } }
    }

    const supabase = createServerSupabaseClient()

    let query = supabase
      .from('shifts')
      .select('*')
      .order('date', { ascending: true })

    // 日付範囲フィルター
    if (options?.startDate) {
      query = query.gte('date', options.startDate)
    }
    if (options?.endDate) {
      query = query.lte('date', options.endDate)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching shifts:', error)
      return { success: false, error: { message: 'シフトデータの処理に失敗しました' } }
    }

    let result = data as Shift[]

    // 一般従業員の場合、他人の休憩理由は非表示
    if (!isAdmin(user)) {
      result = result.map((shift) => {
        if (shift.employee_id !== user.id) {
          return { ...shift, rest_reason: undefined }
        }
        return shift
      })
    }

    return { success: true, data: result }
  } catch (error: unknown) {
    console.error('Unexpected error in getShifts:', error)
    return { success: false, error: { message: 'シフトデータの処理中にエラーが発生しました' } }
  }
}

// POST: 新しいシフト割当の作成
export async function createShift(
  shiftData: Omit<Shift, 'id' | 'created_at' | 'updated_at'>
): Promise<ActionResponse<Shift>> {
  try {
    const user = await requireAdmin()
    if (!user) {
      return { success: false, error: { message: '認証が必要です。管理者権限が必要です' } }
    }

    const body = shiftData as Record<string, unknown>

    // 必須フィールドのバリデーション
    if (!body.employee_id || !body.date) {
      return { success: false, error: { message: '従業員IDと日付は必須です' } }
    }

    const supabase = createServerSupabaseClient()

    // 配置場所IDの解決: IDが渡されていればそのまま使用、なければ名前からID変換を試みる
    let amWorkplaceId = body.am_workplace_id || null
    let pmWorkplaceId = body.pm_workplace_id || null

    // IDがなく名前がある場合、workplacesテーブルから検索（フォールバック）
    if (!amWorkplaceId && body.am_workplace) {
      const { data: amWps } = await supabase
        .from('workplaces')
        .select('id')
        .eq('name', body.am_workplace)
        .eq('is_active', true)
        .limit(1)
      if (amWps && amWps.length > 0) amWorkplaceId = amWps[0].id
    }
    if (!pmWorkplaceId && body.pm_workplace) {
      const { data: pmWps } = await supabase
        .from('workplaces')
        .select('id')
        .eq('name', body.pm_workplace)
        .eq('is_active', true)
        .limit(1)
      if (pmWps && pmWps.length > 0) pmWorkplaceId = pmWps[0].id
    }

    const { data, error } = await supabase
      .from('shifts')
      .insert([
        {
          employee_id: body.employee_id,
          date: body.date,
          shift_pattern_id: body.shift_pattern_id,
          am_workplace: body.am_workplace,
          pm_workplace: body.pm_workplace,
          am_workplace_id: amWorkplaceId,
          pm_workplace_id: pmWorkplaceId,
          custom_start_time: body.custom_start_time,
          custom_end_time: body.custom_end_time,
          is_rest: body.is_rest || false,
          rest_reason: body.rest_reason,
          status: body.status || 'draft'
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('Error creating shift:', error)
      return { success: false, error: { message: 'シフトデータの処理に失敗しました' } }
    }

    return { success: true, data: data as Shift }
  } catch (error: unknown) {
    console.error('Unexpected error in createShift:', error)
    return { success: false, error: { message: 'シフトデータの処理中にエラーが発生しました' } }
  }
}

// PUT: シフト割当の更新
export async function updateShift(
  id: string,
  updates: Partial<Shift>
): Promise<ActionResponse<Shift>> {
  try {
    const user = await requireAdmin()
    if (!user) {
      return { success: false, error: { message: '認証が必要です。管理者権限が必要です' } }
    }

    if (!id) {
      return { success: false, error: { message: 'シフトIDは必須です' } }
    }

    const supabase = createServerSupabaseClient()

    // システムフィールドを除外
    const { created_at, updated_at, id: _id, ...updateData } = updates as Record<string, unknown>

    const { data, error } = await supabase
      .from('shifts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating shift:', error)
      return { success: false, error: { message: 'シフトデータの処理に失敗しました' } }
    }

    return { success: true, data: data as Shift }
  } catch (error: unknown) {
    console.error('Unexpected error in updateShift:', error)
    return { success: false, error: { message: 'シフトデータの処理中にエラーが発生しました' } }
  }
}

// DELETE: シフト割当の削除（物理削除）
export async function deleteShift(id: string): Promise<ActionResponse<{ id: string }>> {
  try {
    const user = await requireAdmin()
    if (!user) {
      return { success: false, error: { message: '認証が必要です。管理者権限が必要です' } }
    }

    if (!id) {
      return { success: false, error: { message: 'シフトIDは必須です' } }
    }

    const supabase = createServerSupabaseClient()

    const { error } = await supabase
      .from('shifts')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting shift:', error)
      return { success: false, error: { message: 'シフトデータの処理に失敗しました' } }
    }

    return { success: true, data: { id } }
  } catch (error: unknown) {
    console.error('Unexpected error in deleteShift:', error)
    return { success: false, error: { message: 'シフトデータの処理中にエラーが発生しました' } }
  }
}
