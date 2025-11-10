// app/api/employees/reorder/route.ts
// 従業員の並び順更新API

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

// PATCH: 従業員の並び順を更新
export async function PATCH(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const body = await request.json()

    const { employeeId, direction } = body

    if (!employeeId || !direction) {
      return NextResponse.json(
        { success: false, error: { message: 'employeeId and direction are required' } },
        { status: 400 }
      )
    }

    if (direction !== 'up' && direction !== 'down') {
      return NextResponse.json(
        { success: false, error: { message: 'direction must be "up" or "down"' } },
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
    const currentIndex = employees.findIndex((emp: any) => emp.id === employeeId)
    if (currentIndex === -1) {
      return NextResponse.json(
        { success: false, error: { message: 'Employee not found' } },
        { status: 404 }
      )
    }

    // 移動先のインデックス
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1

    // 範囲外チェック
    if (targetIndex < 0 || targetIndex >= employees.length) {
      return NextResponse.json(
        { success: false, error: { message: 'Cannot move beyond boundaries' } },
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
      data: { message: 'Order updated successfully' }
    })
  } catch (error: any) {
    console.error('Unexpected error in PATCH /api/employees/reorder:', error)
    return NextResponse.json(
      { success: false, error: { message: error.message } },
      { status: 500 }
    )
  }
}
