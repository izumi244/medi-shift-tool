'use server'

// app/actions/shift-patterns.ts
// シフトパターンのCRUD Server Actions

import { createServerSupabaseClient } from '@/lib/supabase'
import { ShiftPattern } from '@/types'
import { getAuthUser, requireAdmin } from '@/lib/server-action-auth'

// 共通レスポンス型
type ActionResponse<T = unknown> = {
  success: boolean
  data?: T
  error?: { message: string }
}

// GET: 全シフトパターンの取得（全ユーザー読み取り可）
export async function getShiftPatterns(): Promise<ActionResponse<ShiftPattern[]>> {
  try {
    const user = await getAuthUser()
    if (!user) {
      return { success: false, error: { message: '認証が必要です' } }
    }

    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase
      .from('shift_patterns')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching shift patterns:', error)
      return { success: false, error: { message: 'シフトパターンデータの処理に失敗しました' } }
    }

    return { success: true, data: data as ShiftPattern[] }
  } catch (error: unknown) {
    console.error('Unexpected error in getShiftPatterns:', error)
    return { success: false, error: { message: 'シフトパターンデータの処理中にエラーが発生しました' } }
  }
}

// POST: 新しいシフトパターンの作成
export async function createShiftPattern(
  patternData: Omit<ShiftPattern, 'id'>
): Promise<ActionResponse<ShiftPattern>> {
  try {
    const user = await requireAdmin()
    if (!user) {
      return { success: false, error: { message: '認証が必要です。管理者権限が必要です' } }
    }

    const body = patternData as Record<string, unknown>

    // 必須フィールドのバリデーション
    if (!body.name || !body.start_time || !body.end_time) {
      return { success: false, error: { message: '名前、開始時刻、終了時刻は必須です' } }
    }

    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase
      .from('shift_patterns')
      .insert([
        {
          name: body.name,
          start_time: body.start_time,
          end_time: body.end_time,
          break_minutes: body.break_minutes || 0,
          color: body.color || '#e0e7ff',
          is_active: true
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('Error creating shift pattern:', error)
      return { success: false, error: { message: 'シフトパターンデータの処理に失敗しました' } }
    }

    return { success: true, data: data as ShiftPattern }
  } catch (error: unknown) {
    console.error('Unexpected error in createShiftPattern:', error)
    return { success: false, error: { message: 'シフトパターンデータの処理中にエラーが発生しました' } }
  }
}

// PUT: シフトパターンの更新
export async function updateShiftPattern(
  id: string,
  updates: Partial<ShiftPattern>
): Promise<ActionResponse<ShiftPattern>> {
  try {
    const user = await requireAdmin()
    if (!user) {
      return { success: false, error: { message: '認証が必要です。管理者権限が必要です' } }
    }

    if (!id) {
      return { success: false, error: { message: 'シフトパターンIDは必須です' } }
    }

    const supabase = createServerSupabaseClient()

    // システムフィールドを除外
    const { created_at, updated_at, id: _id, ...updateData } = updates as Record<string, unknown>

    const { data, error } = await supabase
      .from('shift_patterns')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating shift pattern:', error)
      return { success: false, error: { message: 'シフトパターンデータの処理に失敗しました' } }
    }

    return { success: true, data: data as ShiftPattern }
  } catch (error: unknown) {
    console.error('Unexpected error in updateShiftPattern:', error)
    return { success: false, error: { message: 'シフトパターンデータの処理中にエラーが発生しました' } }
  }
}

// DELETE: シフトパターンの削除（物理削除）
export async function deleteShiftPattern(id: string): Promise<ActionResponse<{ id: string }>> {
  try {
    const user = await requireAdmin()
    if (!user) {
      return { success: false, error: { message: '認証が必要です。管理者権限が必要です' } }
    }

    if (!id) {
      return { success: false, error: { message: 'シフトパターンIDは必須です' } }
    }

    const supabase = createServerSupabaseClient()

    const { error } = await supabase
      .from('shift_patterns')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting shift pattern:', error)
      return { success: false, error: { message: 'シフトパターンデータの処理に失敗しました' } }
    }

    return { success: true, data: { id } }
  } catch (error: unknown) {
    console.error('Unexpected error in deleteShiftPattern:', error)
    return { success: false, error: { message: 'シフトパターンデータの処理中にエラーが発生しました' } }
  }
}
