// app/api/leave-requests/route.ts
// 希望休申請のCRUD API（ロールベースアクセス制御付き）

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { LeaveRequest } from '@/types'
import { authenticateRequest, isAdmin } from '@/lib/api-auth'

// GET: 全希望休申請の取得
// Admin/developer: 全データ返却
// Employee: leave_typeを自分のリクエスト以外は'休み'に置換
export async function GET(request: NextRequest) {
  try {
    const user = await authenticateRequest(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: { message: '認証が必要です' } },
        { status: 401 }
      )
    }

    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase
      .from('leave_requests')
      .select('*')
      .order('date', { ascending: false })

    if (error) {
      console.error('Error fetching leave requests:', error)
      return NextResponse.json(
        { success: false, error: { message: '希望休データの処理に失敗しました' } },
        { status: 500 }
      )
    }

    let result = data as LeaveRequest[]

    // 一般従業員の場合、他人のleave_typeを非表示にする
    if (!isAdmin(user)) {
      result = result.map((req) => {
        if (req.employee_id !== user.id) {
          return { ...req, leave_type: '休み' as LeaveRequest['leave_type'] }
        }
        return req
      })
    }

    return NextResponse.json({
      success: true,
      data: result
    })
  } catch (error: unknown) {
    console.error('Unexpected error in GET /api/leave-requests:', error)
    return NextResponse.json(
      { success: false, error: { message: '希望休データの処理中にエラーが発生しました' } },
      { status: 500 }
    )
  }
}

// POST: 新しい希望休申請の作成
// Admin/developer: 任意の従業員に対して作成可能
// Employee: 自分自身の申請のみ作成可能
export async function POST(request: NextRequest) {
  try {
    const user = await authenticateRequest(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: { message: '認証が必要です' } },
        { status: 401 }
      )
    }

    const supabase = createServerSupabaseClient()
    const body = await request.json()

    // 必須フィールドのバリデーション
    if (!body.employee_id || !body.date || !body.leave_type) {
      return NextResponse.json(
        {
          success: false,
          error: { message: '従業員ID、日付、休暇種別は必須です' }
        },
        { status: 400 }
      )
    }

    // 一般従業員は自分自身の申請のみ作成可能
    if (!isAdmin(user) && body.employee_id !== user.id) {
      return NextResponse.json(
        { success: false, error: { message: '他の従業員の希望休を申請する権限がありません' } },
        { status: 403 }
      )
    }

    const { data, error } = await supabase
      .from('leave_requests')
      .insert([
        {
          employee_id: body.employee_id,
          date: body.date,
          leave_type: body.leave_type,
          reason: body.reason,
          status: body.status || '申請中'
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('Error creating leave request:', error)
      return NextResponse.json(
        { success: false, error: { message: '希望休データの処理に失敗しました' } },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: data as LeaveRequest
    }, { status: 201 })
  } catch (error: unknown) {
    console.error('Unexpected error in POST /api/leave-requests:', error)
    return NextResponse.json(
      { success: false, error: { message: '希望休データの処理中にエラーが発生しました' } },
      { status: 500 }
    )
  }
}

// PUT: 希望休申請の更新
// Admin/developer: 任意のリクエストを更新可能（承認・却下含む）
// Employee: 自分の申請のみ、かつステータスが'申請中'の場合のみ更新可能。ステータスを'承認'や'却下'に変更不可。
export async function PUT(request: NextRequest) {
  try {
    const user = await authenticateRequest(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: { message: '認証が必要です' } },
        { status: 401 }
      )
    }

    const supabase = createServerSupabaseClient()
    const body = await request.json()

    if (!body.id) {
      return NextResponse.json(
        { success: false, error: { message: '希望休申請IDは必須です' } },
        { status: 400 }
      )
    }

    // 一般従業員の場合、権限チェックを行う
    if (!isAdmin(user)) {
      // まず既存のリクエストを取得して所有者とステータスを確認
      const { data: existing, error: fetchError } = await supabase
        .from('leave_requests')
        .select('*')
        .eq('id', body.id)
        .single()

      if (fetchError || !existing) {
        return NextResponse.json(
          { success: false, error: { message: '希望休申請が見つかりません' } },
          { status: 404 }
        )
      }

      // 自分のリクエストでない場合は拒否
      if (existing.employee_id !== user.id) {
        return NextResponse.json(
          { success: false, error: { message: '他の従業員の希望休を更新する権限がありません' } },
          { status: 403 }
        )
      }

      // ステータスが'申請中'でない場合は拒否
      if (existing.status !== '申請中') {
        return NextResponse.json(
          { success: false, error: { message: '申請中の希望休のみ変更できます' } },
          { status: 403 }
        )
      }

      // 従業員がステータスを'承認'や'却下'に変更しようとした場合は拒否
      if (body.status && (body.status === '承認' || body.status === '却下')) {
        return NextResponse.json(
          { success: false, error: { message: '承認・却下の権限がありません' } },
          { status: 403 }
        )
      }
    }

    // idを除いた更新データを準備
    const { id, created_at, updated_at, ...updateData } = body

    const { data, error } = await supabase
      .from('leave_requests')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating leave request:', error)
      return NextResponse.json(
        { success: false, error: { message: '希望休データの処理に失敗しました' } },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: data as LeaveRequest
    })
  } catch (error: unknown) {
    console.error('Unexpected error in PUT /api/leave-requests:', error)
    return NextResponse.json(
      { success: false, error: { message: '希望休データの処理中にエラーが発生しました' } },
      { status: 500 }
    )
  }
}

// DELETE: 希望休申請の削除（物理削除）
// Admin/developer: 任意のリクエストを削除可能
// Employee: 自分の申請のみ、かつステータスが'申請中'の場合のみ削除可能
export async function DELETE(request: NextRequest) {
  try {
    const user = await authenticateRequest(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: { message: '認証が必要です' } },
        { status: 401 }
      )
    }

    const supabase = createServerSupabaseClient()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: { message: '希望休申請IDは必須です' } },
        { status: 400 }
      )
    }

    // 一般従業員の場合、権限チェックを行う
    if (!isAdmin(user)) {
      const { data: existing, error: fetchError } = await supabase
        .from('leave_requests')
        .select('*')
        .eq('id', id)
        .single()

      if (fetchError || !existing) {
        return NextResponse.json(
          { success: false, error: { message: '希望休申請が見つかりません' } },
          { status: 404 }
        )
      }

      // 自分のリクエストでない場合は拒否
      if (existing.employee_id !== user.id) {
        return NextResponse.json(
          { success: false, error: { message: '他の従業員の希望休を削除する権限がありません' } },
          { status: 403 }
        )
      }

      // ステータスが'申請中'でない場合は拒否
      if (existing.status !== '申請中') {
        return NextResponse.json(
          { success: false, error: { message: '申請中の希望休のみ削除できます' } },
          { status: 403 }
        )
      }
    }

    const { error } = await supabase
      .from('leave_requests')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting leave request:', error)
      return NextResponse.json(
        { success: false, error: { message: '希望休データの処理に失敗しました' } },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: { id }
    })
  } catch (error: unknown) {
    console.error('Unexpected error in DELETE /api/leave-requests:', error)
    return NextResponse.json(
      { success: false, error: { message: '希望休データの処理中にエラーが発生しました' } },
      { status: 500 }
    )
  }
}
