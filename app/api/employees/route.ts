// app/api/employees/route.ts
// 従業員のCRUD API

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { Employee } from '@/types'

// GET: 全従業員の取得
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()

    const { data, error} = await supabase
      .from('employees')
      .select('*')
      .eq('is_active', true)
      .order('order_index', { ascending: true })
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching employees:', error)
      return NextResponse.json(
        { success: false, error: { message: error.message, code: error.code } },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: data as Employee[]
    })
  } catch (error: any) {
    console.error('Unexpected error in GET /api/employees:', error)
    return NextResponse.json(
      { success: false, error: { message: error.message } },
      { status: 500 }
    )
  }
}

// POST: 新しい従業員の作成
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const body = await request.json()

    // 必須フィールドのバリデーション
    if (!body.name || !body.employment_type || !body.job_type) {
      return NextResponse.json(
        {
          success: false,
          error: { message: 'Name, employment_type, and job_type are required' }
        },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('employees')
      .insert([
        {
          name: body.name,
          employment_type: body.employment_type,
          job_type: body.job_type,
          assignable_workplaces_by_day: body.assignable_workplaces_by_day || {},
          assignable_shift_pattern_ids: body.assignable_shift_pattern_ids || [],
          day_constraints: body.day_constraints || [],
          available_days: body.available_days || [],
          phone: body.phone,
          email: body.email,
          notes: body.notes,
          is_active: true
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('Error creating employee:', error)
      return NextResponse.json(
        { success: false, error: { message: error.message, code: error.code } },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: data as Employee
    }, { status: 201 })
  } catch (error: any) {
    console.error('Unexpected error in POST /api/employees:', error)
    return NextResponse.json(
      { success: false, error: { message: error.message } },
      { status: 500 }
    )
  }
}

// PUT: 従業員の更新
export async function PUT(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const body = await request.json()

    if (!body.id) {
      return NextResponse.json(
        { success: false, error: { message: 'Employee ID is required' } },
        { status: 400 }
      )
    }

    // idを除いた更新データを準備
    const { id, created_at, updated_at, ...updateData } = body

    const { data, error } = await supabase
      .from('employees')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating employee:', error)
      return NextResponse.json(
        { success: false, error: { message: error.message, code: error.code } },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: data as Employee
    })
  } catch (error: any) {
    console.error('Unexpected error in PUT /api/employees:', error)
    return NextResponse.json(
      { success: false, error: { message: error.message } },
      { status: 500 }
    )
  }
}

// DELETE: 従業員の削除（物理削除）
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: { message: 'Employee ID is required' } },
        { status: 400 }
      )
    }

    // 物理削除（データベースから完全に削除）
    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting employee:', error)
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
    console.error('Unexpected error in DELETE /api/employees:', error)
    return NextResponse.json(
      { success: false, error: { message: error.message } },
      { status: 500 }
    )
  }
}
