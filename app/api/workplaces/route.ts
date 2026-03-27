// app/api/workplaces/route.ts
// 配置場所のCRUD API

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { Workplace } from '@/types'
import { authenticateRequest } from '@/lib/api-auth'

// GET: 全配置場所の取得
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
      .from('workplaces')
      .select('*')
      .eq('is_active', true)
      .order('day_of_week', { ascending: true })
      .order('time_slot', { ascending: true })
      .order('order_index', { ascending: true })

    if (error) {
      console.error('Error fetching workplaces:', error)
      return NextResponse.json(
        { success: false, error: { message: '配置場所データの処理に失敗しました' } },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: data as Workplace[]
    })
  } catch (error: unknown) {
    console.error('Unexpected error in GET /api/workplaces:', error)
    return NextResponse.json(
      { success: false, error: { message: '配置場所データの処理中にエラーが発生しました' } },
      { status: 500 }
    )
  }
}

// POST: 新しい配置場所の作成
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
    if (!body.name || !body.facility || !body.time_slot || !body.day_of_week) {
      return NextResponse.json(
        {
          success: false,
          error: { message: '名前、施設、時間帯、曜日は必須です' }
        },
        { status: 400 }
      )
    }

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
      console.error('Error creating workplace:', error)
      return NextResponse.json(
        { success: false, error: { message: '配置場所データの処理に失敗しました' } },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: data as Workplace
    }, { status: 201 })
  } catch (error: unknown) {
    console.error('Unexpected error in POST /api/workplaces:', error)
    return NextResponse.json(
      { success: false, error: { message: '配置場所データの処理中にエラーが発生しました' } },
      { status: 500 }
    )
  }
}

// PUT: 配置場所の更新
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
        { success: false, error: { message: '配置場所IDは必須です' } },
        { status: 400 }
      )
    }

    // idを除いた更新データを準備
    const { id, created_at, updated_at, ...updateData } = body

    const { data, error } = await supabase
      .from('workplaces')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating workplace:', error)
      return NextResponse.json(
        { success: false, error: { message: '配置場所データの処理に失敗しました' } },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: data as Workplace
    })
  } catch (error: unknown) {
    console.error('Unexpected error in PUT /api/workplaces:', error)
    return NextResponse.json(
      { success: false, error: { message: '配置場所データの処理中にエラーが発生しました' } },
      { status: 500 }
    )
  }
}

// DELETE: 配置場所の削除（物理削除）
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
        { success: false, error: { message: '配置場所IDは必須です' } },
        { status: 400 }
      )
    }

    // 物理削除（データベースから完全に削除）
    const { error } = await supabase
      .from('workplaces')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting workplace:', error)
      return NextResponse.json(
        { success: false, error: { message: '配置場所データの処理に失敗しました' } },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: { id }
    })
  } catch (error: unknown) {
    console.error('Unexpected error in DELETE /api/workplaces:', error)
    return NextResponse.json(
      { success: false, error: { message: '配置場所データの処理中にエラーが発生しました' } },
      { status: 500 }
    )
  }
}
