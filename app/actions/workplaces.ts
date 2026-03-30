'use server'

// app/actions/workplaces.ts
// 配置場所のCRUD Server Actions

import { createServerSupabaseClient } from '@/lib/supabase'
import { Workplace } from '@/types'
import { getAuthUser, requireAdmin } from '@/lib/server-action-auth'

// 共通レスポンス型
type ActionResponse<T = unknown> = {
  success: boolean
  data?: T
  error?: { message: string }
}

// GET: 全配置場所の取得（全ユーザー読み取り可）
export async function getWorkplaces(): Promise<ActionResponse<Workplace[]>> {
  try {
    const user = await getAuthUser()
    if (!user) {
      return { success: false, error: { message: '認証が必要です' } }
    }

    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase
      .from('workplaces')
      .select('*')
      .eq('is_active', true)
      .order('day_of_week', { ascending: true })
      .order('time_slot', { ascending: true })
      .order('order_index', { ascending: true })

    if (error) {
      console.error('配置場所取得エラー:', error)
      return { success: false, error: { message: '配置場所データの処理に失敗しました' } }
    }

    return { success: true, data: data as Workplace[] }
  } catch (error: unknown) {
    console.error('配置場所取得の予期しないエラー:', error)
    return { success: false, error: { message: '配置場所データの処理中にエラーが発生しました' } }
  }
}

// POST: 新しい配置場所の作成
export async function createWorkplace(
  workplaceData: Omit<Workplace, 'id' | 'created_at' | 'updated_at'>
): Promise<ActionResponse<Workplace>> {
  try {
    const user = await requireAdmin()
    if (!user) {
      return { success: false, error: { message: '認証が必要です。管理者権限が必要です' } }
    }

    const body = workplaceData as Record<string, unknown>

    // 必須フィールドのバリデーション
    if (!body.name || !body.facility || !body.time_slot || !body.day_of_week) {
      return { success: false, error: { message: '名前、施設、時間帯、曜日は必須です' } }
    }

    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase
      .from('workplaces')
      .insert([
        {
          name: body.name,
          facility: body.facility,
          time_slot: body.time_slot,
          day_of_week: body.day_of_week,
          required_count: body.required_count || 1,
          remarks: body.remarks,
          order_index: body.order_index || 0,
          is_active: true
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('配置場所作成エラー:', error)
      return { success: false, error: { message: '配置場所データの処理に失敗しました' } }
    }

    return { success: true, data: data as Workplace }
  } catch (error: unknown) {
    console.error('配置場所作成の予期しないエラー:', error)
    return { success: false, error: { message: '配置場所データの処理中にエラーが発生しました' } }
  }
}

// PUT: 配置場所の更新
export async function updateWorkplace(
  id: string,
  updates: Partial<Workplace>
): Promise<ActionResponse<Workplace>> {
  try {
    const user = await requireAdmin()
    if (!user) {
      return { success: false, error: { message: '認証が必要です。管理者権限が必要です' } }
    }

    if (!id) {
      return { success: false, error: { message: '配置場所IDは必須です' } }
    }

    const supabase = createServerSupabaseClient()

    // システムフィールドを除外
    const { created_at, updated_at, id: _id, ...updateData } = updates as Record<string, unknown>

    const { data, error } = await supabase
      .from('workplaces')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('配置場所更新エラー:', error)
      return { success: false, error: { message: '配置場所データの処理に失敗しました' } }
    }

    return { success: true, data: data as Workplace }
  } catch (error: unknown) {
    console.error('配置場所更新の予期しないエラー:', error)
    return { success: false, error: { message: '配置場所データの処理中にエラーが発生しました' } }
  }
}

// DELETE: 配置場所の削除（物理削除）
export async function deleteWorkplace(id: string): Promise<ActionResponse<{ id: string }>> {
  try {
    const user = await requireAdmin()
    if (!user) {
      return { success: false, error: { message: '認証が必要です。管理者権限が必要です' } }
    }

    if (!id) {
      return { success: false, error: { message: '配置場所IDは必須です' } }
    }

    const supabase = createServerSupabaseClient()

    const { error } = await supabase
      .from('workplaces')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('配置場所削除エラー:', error)
      return { success: false, error: { message: '配置場所データの処理に失敗しました' } }
    }

    return { success: true, data: { id } }
  } catch (error: unknown) {
    console.error('配置場所削除の予期しないエラー:', error)
    return { success: false, error: { message: '配置場所データの処理中にエラーが発生しました' } }
  }
}
