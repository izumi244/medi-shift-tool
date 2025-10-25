// app/api/shift-patterns/route.ts
// シフトパターンのCRUD API

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { ShiftPattern } from '@/types'

// GET: 全シフトパターンの取得
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase
      .from('shift_patterns')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching shift patterns:', error)
      return NextResponse.json(
        { success: false, error: { message: error.message, code: error.code } },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: data as ShiftPattern[]
    })
  } catch (error: any) {
    console.error('Unexpected error in GET /api/shift-patterns:', error)
    return NextResponse.json(
      { success: false, error: { message: error.message } },
      { status: 500 }
    )
  }
}

// POST: 新しいシフトパターンの作成
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const body = await request.json()

    // 必須フィールドのバリデーション
    if (!body.name || !body.start_time || !body.end_time) {
      return NextResponse.json(
        {
          success: false,
          error: { message: 'Name, start_time, and end_time are required' }
        },
        { status: 400 }
      )
    }

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
      return NextResponse.json(
        { success: false, error: { message: error.message, code: error.code } },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: data as ShiftPattern
    }, { status: 201 })
  } catch (error: any) {
    console.error('Unexpected error in POST /api/shift-patterns:', error)
    return NextResponse.json(
      { success: false, error: { message: error.message } },
      { status: 500 }
    )
  }
}

// PUT: シフトパターンの更新
export async function PUT(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const body = await request.json()

    if (!body.id) {
      return NextResponse.json(
        { success: false, error: { message: 'Shift pattern ID is required' } },
        { status: 400 }
      )
    }

    // idを除いた更新データを準備
    const { id, created_at, updated_at, ...updateData } = body

    const { data, error } = await supabase
      .from('shift_patterns')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating shift pattern:', error)
      return NextResponse.json(
        { success: false, error: { message: error.message, code: error.code } },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: data as ShiftPattern
    })
  } catch (error: any) {
    console.error('Unexpected error in PUT /api/shift-patterns:', error)
    return NextResponse.json(
      { success: false, error: { message: error.message } },
      { status: 500 }
    )
  }
}

// DELETE: シフトパターンの削除（物理削除）
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: { message: 'Shift pattern ID is required' } },
        { status: 400 }
      )
    }

    // 物理削除（データベースから完全に削除）
    const { error } = await supabase
      .from('shift_patterns')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting shift pattern:', error)
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
    console.error('Unexpected error in DELETE /api/shift-patterns:', error)
    return NextResponse.json(
      { success: false, error: { message: error.message } },
      { status: 500 }
    )
  }
}
