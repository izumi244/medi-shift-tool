// app/api/shifts/route.ts
// シフト割当のCRUD API

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { Shift } from '@/types'

// GET: シフト割当の取得（日付範囲指定可能）
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')

    let query = supabase
      .from('shifts')
      .select('*')
      .order('date', { ascending: true })

    // 日付範囲フィルター
    if (startDate) {
      query = query.gte('date', startDate)
    }
    if (endDate) {
      query = query.lte('date', endDate)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching shifts:', error)
      return NextResponse.json(
        { success: false, error: { message: error.message, code: error.code } },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: data as Shift[]
    })
  } catch (error: any) {
    console.error('Unexpected error in GET /api/shifts:', error)
    return NextResponse.json(
      { success: false, error: { message: error.message } },
      { status: 500 }
    )
  }
}

// POST: 新しいシフト割当の作成
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const body = await request.json()

    // 必須フィールドのバリデーション
    if (!body.employee_id || !body.date) {
      return NextResponse.json(
        {
          success: false,
          error: { message: 'Employee ID and date are required' }
        },
        { status: 400 }
      )
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
      return NextResponse.json(
        { success: false, error: { message: error.message, code: error.code } },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: data as Shift
    }, { status: 201 })
  } catch (error: any) {
    console.error('Unexpected error in POST /api/shifts:', error)
    return NextResponse.json(
      { success: false, error: { message: error.message } },
      { status: 500 }
    )
  }
}

// PUT: シフト割当の更新
export async function PUT(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const body = await request.json()

    if (!body.id) {
      return NextResponse.json(
        { success: false, error: { message: 'Shift ID is required' } },
        { status: 400 }
      )
    }

    // idを除いた更新データを準備
    const { id, created_at, updated_at, ...updateData } = body

    const { data, error } = await supabase
      .from('shifts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating shift:', error)
      return NextResponse.json(
        { success: false, error: { message: error.message, code: error.code } },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: data as Shift
    })
  } catch (error: any) {
    console.error('Unexpected error in PUT /api/shifts:', error)
    return NextResponse.json(
      { success: false, error: { message: error.message } },
      { status: 500 }
    )
  }
}

// DELETE: シフト割当の削除（物理削除）
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: { message: 'Shift ID is required' } },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('shifts')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting shift:', error)
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
    console.error('Unexpected error in DELETE /api/shifts:', error)
    return NextResponse.json(
      { success: false, error: { message: error.message } },
      { status: 500 }
    )
  }
}
