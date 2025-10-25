// app/api/leave-requests/route.ts
// 希望休申請のCRUD API

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { LeaveRequest } from '@/types'

// GET: 全希望休申請の取得
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase
      .from('leave_requests')
      .select('*')
      .order('date', { ascending: false })

    if (error) {
      console.error('Error fetching leave requests:', error)
      return NextResponse.json(
        { success: false, error: { message: error.message, code: error.code } },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: data as LeaveRequest[]
    })
  } catch (error: any) {
    console.error('Unexpected error in GET /api/leave-requests:', error)
    return NextResponse.json(
      { success: false, error: { message: error.message } },
      { status: 500 }
    )
  }
}

// POST: 新しい希望休申請の作成
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const body = await request.json()

    // 必須フィールドのバリデーション
    if (!body.employee_id || !body.date || !body.leave_type) {
      return NextResponse.json(
        {
          success: false,
          error: { message: 'Employee ID, date, and leave_type are required' }
        },
        { status: 400 }
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
        { success: false, error: { message: error.message, code: error.code } },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: data as LeaveRequest
    }, { status: 201 })
  } catch (error: any) {
    console.error('Unexpected error in POST /api/leave-requests:', error)
    return NextResponse.json(
      { success: false, error: { message: error.message } },
      { status: 500 }
    )
  }
}

// PUT: 希望休申請の更新
export async function PUT(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const body = await request.json()

    if (!body.id) {
      return NextResponse.json(
        { success: false, error: { message: 'Leave request ID is required' } },
        { status: 400 }
      )
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
        { success: false, error: { message: error.message, code: error.code } },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: data as LeaveRequest
    })
  } catch (error: any) {
    console.error('Unexpected error in PUT /api/leave-requests:', error)
    return NextResponse.json(
      { success: false, error: { message: error.message } },
      { status: 500 }
    )
  }
}

// DELETE: 希望休申請の削除（物理削除）
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: { message: 'Leave request ID is required' } },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('leave_requests')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting leave request:', error)
      return NextResponse.json(
        { success: false, error: { message: error.message, code: error.code } },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: { id }
    })
  } catch (error: any) {
    console.error('Unexpected error in DELETE /api/leave-requests:', error)
    return NextResponse.json(
      { success: false, error: { message: error.message } },
      { status: 500 }
    )
  }
}
