'use server'

// app/actions/constraints.ts
// AI制約ガイドラインのCRUD Server Actions

import { createServerSupabaseClient } from '@/lib/supabase'
import { AIConstraintGuideline } from '@/types'
import { requireAdmin } from '@/lib/server-action-auth'

// 共通レスポンス型
type ActionResponse<T = unknown> = {
  success: boolean
  data?: T
  error?: { message: string }
}

// GET: 全AI制約ガイドラインの取得
export async function getConstraints(): Promise<ActionResponse<AIConstraintGuideline[]>> {
  try {
    const user = await requireAdmin()
    if (!user) {
      return { success: false, error: { message: '認証が必要です。管理者権限が必要です' } }
    }

    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase
      .from('ai_constraint_guidelines')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching constraints:', error)
      return { success: false, error: { message: '制約データの処理に失敗しました' } }
    }

    return { success: true, data: data as AIConstraintGuideline[] }
  } catch (error: unknown) {
    console.error('Unexpected error in getConstraints:', error)
    return { success: false, error: { message: '制約データの処理中にエラーが発生しました' } }
  }
}

// POST: 新しいAI制約ガイドラインの作成
export async function createConstraint(
  constraintData: Omit<AIConstraintGuideline, 'id' | 'created_at' | 'updated_at'>
): Promise<ActionResponse<AIConstraintGuideline>> {
  try {
    const user = await requireAdmin()
    if (!user) {
      return { success: false, error: { message: '認証が必要です。管理者権限が必要です' } }
    }

    const body = constraintData as Record<string, unknown>

    // 必須フィールドのバリデーション
    if (!body.constraint_content) {
      return { success: false, error: { message: '制約内容は必須です' } }
    }

    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase
      .from('ai_constraint_guidelines')
      .insert([
        {
          constraint_content: body.constraint_content,
          is_active: true
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('Error creating constraint:', error)
      return { success: false, error: { message: '制約データの処理に失敗しました' } }
    }

    return { success: true, data: data as AIConstraintGuideline }
  } catch (error: unknown) {
    console.error('Unexpected error in createConstraint:', error)
    return { success: false, error: { message: '制約データの処理中にエラーが発生しました' } }
  }
}

// PUT: AI制約ガイドラインの更新
export async function updateConstraint(
  id: string,
  updates: Partial<AIConstraintGuideline>
): Promise<ActionResponse<AIConstraintGuideline>> {
  try {
    const user = await requireAdmin()
    if (!user) {
      return { success: false, error: { message: '認証が必要です。管理者権限が必要です' } }
    }

    if (!id) {
      return { success: false, error: { message: '制約IDは必須です' } }
    }

    const supabase = createServerSupabaseClient()

    // システムフィールドを除外
    const { created_at, updated_at, id: _id, ...updateData } = updates as Record<string, unknown>

    const { data, error } = await supabase
      .from('ai_constraint_guidelines')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating constraint:', error)
      return { success: false, error: { message: '制約データの処理に失敗しました' } }
    }

    return { success: true, data: data as AIConstraintGuideline }
  } catch (error: unknown) {
    console.error('Unexpected error in updateConstraint:', error)
    return { success: false, error: { message: '制約データの処理中にエラーが発生しました' } }
  }
}

// DELETE: AI制約ガイドラインの削除（物理削除）
export async function deleteConstraint(id: string): Promise<ActionResponse<{ id: string }>> {
  try {
    const user = await requireAdmin()
    if (!user) {
      return { success: false, error: { message: '認証が必要です。管理者権限が必要です' } }
    }

    if (!id) {
      return { success: false, error: { message: '制約IDは必須です' } }
    }

    const supabase = createServerSupabaseClient()

    const { error } = await supabase
      .from('ai_constraint_guidelines')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting constraint:', error)
      return { success: false, error: { message: '制約データの処理に失敗しました' } }
    }

    return { success: true, data: { id } }
  } catch (error: unknown) {
    console.error('Unexpected error in deleteConstraint:', error)
    return { success: false, error: { message: '制約データの処理中にエラーが発生しました' } }
  }
}
