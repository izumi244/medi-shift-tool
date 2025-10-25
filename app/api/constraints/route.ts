// app/api/constraints/route.ts
// AI制約ガイドラインのCRUD API（シンプル化版）

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { AIConstraintGuideline } from '@/types'

// GET: 全AI制約ガイドラインの取得
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase
      .from('ai_constraint_guidelines')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching constraints:', error)
      return NextResponse.json(
        { success: false, error: { message: error.message, code: error.code } },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: data as AIConstraintGuideline[]
    })
  } catch (error: any) {
    console.error('Unexpected error in GET /api/constraints:', error)
    return NextResponse.json(
      { success: false, error: { message: error.message } },
      { status: 500 }
    )
  }
}

// POST: 新しいAI制約ガイドラインの作成
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const body = await request.json()

    // 必須フィールドのバリデーション
    if (!body.constraint_content) {
      return NextResponse.json(
        {
          success: false,
          error: { message: 'Constraint content is required' }
        },
        { status: 400 }
      )
    }

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
      return NextResponse.json(
        { success: false, error: { message: error.message, code: error.code } },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: data as AIConstraintGuideline
    }, { status: 201 })
  } catch (error: any) {
    console.error('Unexpected error in POST /api/constraints:', error)
    return NextResponse.json(
      { success: false, error: { message: error.message } },
      { status: 500 }
    )
  }
}

// PUT: AI制約ガイドラインの更新
export async function PUT(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const body = await request.json()

    if (!body.id) {
      return NextResponse.json(
        { success: false, error: { message: 'Constraint ID is required' } },
        { status: 400 }
      )
    }

    // idを除いた更新データを準備
    const { id, created_at, updated_at, ...updateData } = body

    const { data, error } = await supabase
      .from('ai_constraint_guidelines')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating constraint:', error)
      return NextResponse.json(
        { success: false, error: { message: error.message, code: error.code } },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: data as AIConstraintGuideline
    })
  } catch (error: any) {
    console.error('Unexpected error in PUT /api/constraints:', error)
    return NextResponse.json(
      { success: false, error: { message: error.message } },
      { status: 500 }
    )
  }
}

// DELETE: AI制約ガイドラインの削除（物理削除）
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: { message: 'Constraint ID is required' } },
        { status: 400 }
      )
    }

    // 物理削除（データベースから完全に削除）
    const { error } = await supabase
      .from('ai_constraint_guidelines')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting constraint:', error)
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
    console.error('Unexpected error in DELETE /api/constraints:', error)
    return NextResponse.json(
      { success: false, error: { message: error.message } },
      { status: 500 }
    )
  }
}
