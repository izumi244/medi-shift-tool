// app/api/employees/reorder/route.ts
// 従業員の並び順更新API

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { authenticateRequest, isAdmin } from '@/lib/api-auth'

// PATCH: 従業員の並び順を更新
export async function PATCH(request: NextRequest) {
  try {
    const user = await authenticateRequest(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: { message: '認証が必要です' } },
        { status: 401 }
      )
    }

    if (!isAdmin(user)) {
      return NextResponse.json(
        { success: false, error: { message: 'この操作には管理者権限が必要です' } },
        { status: 403 }
      )
    }

    const supabase = createServerSupabaseClient()
    const body = await request.json()

    const { employeeId, direction } = body

    if (!employeeId || !direction) {
      return NextResponse.json(
        { success: false, error: { message: '従業員IDと方向は必須です' } },
        { status: 400 }
      )
    }

    if (direction !== 'up' && direction !== 'down') {
      return NextResponse.json(
        { success: false, error: { message: '方向は「up」または「down」である必要があります' } },
        { status: 400 }
      )
    }

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
      return NextResponse.json(
        { success: false, error: { message: '従業員が見つかりません' } },
        { status: 404 }
      )
    }

    // 移動先のインデックス
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1

    // 範囲外チェック
    if (targetIndex < 0 || targetIndex >= employees.length) {
      return NextResponse.json(
        { success: false, error: { message: 'これ以上移動できません' } },
        { status: 400 }
      )
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

    return NextResponse.json({
      success: true,
      data: { message: '並び順を更新しました' }
    })
  } catch (error: unknown) {
    console.error('Unexpected error in PATCH /api/employees/reorder:', error)
    return NextResponse.json(
      { success: false, error: { message: '従業員の並び替え中にエラーが発生しました' } },
      { status: 500 }
    )
  }
}
