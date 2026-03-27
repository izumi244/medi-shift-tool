// app/api/generate-shift/route.ts
// AIシフト自動生成API - Dify Workflow連携

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import type { Employee, Workplace, ShiftPattern, LeaveRequest, AIConstraintGuideline } from '@/types'
import { authenticateRequest } from '@/lib/api-auth'

// カレンダー生成関数（指定月の全日付を生成）
function generateMonthCalendar(targetMonth: string) {
  const [year, month] = targetMonth.split('-').map(Number)
  const calendar = []
  const daysInMonth = new Date(year, month, 0).getDate()

  const dayNames = ['日', '月', '火', '水', '木', '金', '土']

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day)
    const dayOfWeek = date.getDay()

    calendar.push({
      date: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      day_of_week: dayNames[dayOfWeek],
      day_number: day
    })
  }

  return calendar
}

interface GenerateShiftRequest {
  target_month: string
  special_requests?: string
}

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
    const body: GenerateShiftRequest = await request.json()

    if (!body.target_month) {
      return NextResponse.json(
        { success: false, error: { message: '対象月が指定されていません' } },
        { status: 400 }
      )
    }

    // Dify APIキーとURLを環境変数から取得
    const difyApiKey = process.env.DIFY_API_KEY
    const difyApiUrl = process.env.DIFY_API_URL

    if (!difyApiKey) {
      throw new Error('DIFY_API_KEY環境変数が設定されていません')
    }
    if (!difyApiUrl) {
      throw new Error('DIFY_API_URL環境変数が設定されていません')
    }

    // データベースから必要なデータを取得
    // 対象月の開始日と終了日を計算
    const [year, month] = body.target_month.split('-').map(Number)
    const startDate = `${body.target_month}-01`
    const endDate = new Date(year, month, 0).getDate() // 月の最終日
    const lastDate = `${body.target_month}-${String(endDate).padStart(2, '0')}`

    const [
      { data: employees, error: employeesError },
      { data: workplaces, error: workplacesError },
      { data: shiftPatterns, error: patternsError },
      { data: leaveRequests, error: leavesError },
      { data: constraints, error: constraintsError }
    ] = await Promise.all([
      supabase.from('employees').select('*').eq('is_active', true).order('order_index', { ascending: true }),
      supabase.from('workplaces').select('*').eq('is_active', true).order('order_index', { ascending: true }),
      supabase.from('shift_patterns').select('*').order('created_at', { ascending: false }),
      supabase.from('leave_requests').select('*').gte('date', startDate).lte('date', lastDate).eq('status', '承認'),
      supabase.from('ai_constraint_guidelines').select('*').eq('is_active', true)
    ])

    if (employeesError || workplacesError || patternsError || leavesError || constraintsError) {
      console.error('Data fetch error:', { employeesError, workplacesError, patternsError, leavesError, constraintsError })
      return NextResponse.json(
        { success: false, error: { message: 'データの取得に失敗しました' } },
        { status: 500 }
      )
    }

    // カレンダー生成
    const calendar = generateMonthCalendar(body.target_month)

    // シンプルなカレンダーフォーマット（日付と曜日）
    const calendarSimple = `営業日一覧:\n${calendar.map(d => `${d.date} (${d.day_of_week})`).join('\n')}`

    // 制約条件を文字列に結合
    const constraintsText = constraints && constraints.length > 0
      ? constraints.map((c: AIConstraintGuideline) => `- ${c.constraint_content}`).join('\n')
      : '制約条件なし'

    const allConstraints = [
      constraintsText,
      body.special_requests ? `\n【特別要望】\n${body.special_requests}` : ''
    ].filter(Boolean).join('\n')

    // Difyへ送信するデータ
    const difyInputs = {
      target_month: body.target_month,
      calendar: calendarSimple,
      employees: JSON.stringify(employees, null, 2),
      workplaces: JSON.stringify(workplaces, null, 2),
      shift_patterns: JSON.stringify(shiftPatterns, null, 2),
      leave_requests: JSON.stringify(leaveRequests, null, 2),
      constraints: allConstraints,
    }

    // Dify Workflow APIを呼び出し（ストリーミングモード）
    const response = await fetch(`${difyApiUrl}/workflows/run`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${difyApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: difyInputs,
        response_mode: 'streaming',
        user: 'shift-admin',
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Dify API error:', errorText)
      return NextResponse.json(
        { success: false, error: { message: 'シフト生成サービスへの接続に失敗しました' } },
        { status: response.status }
      )
    }

    // ストリーミングレスポンスを処理
    const reader = response.body?.getReader()
    const decoder = new TextDecoder()
    let fullText = ''

    if (!reader) {
      throw new Error('レスポンスボディがnullです')
    }

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value, { stream: true })
      const lines = chunk.split('\n')

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const jsonData = JSON.parse(line.substring(6))

            // workflow_finishedイベントからデータを取得
            if (jsonData.event === 'workflow_finished') {
              const outputs = jsonData.data?.outputs
              if (outputs && outputs.result) {
                fullText = outputs.result
              }
            }

            // text_chunkイベントからテキストを収集
            if (jsonData.event === 'text_chunk') {
              fullText += jsonData.data?.text || ''
            }

            // node_finishedイベントも確認（LLMノードの出力）
            if (jsonData.event === 'node_finished' && jsonData.data?.node_type === 'llm') {
              const outputs = jsonData.data?.outputs
              if (outputs && outputs.text) {
                fullText = outputs.text
              }
            }
          } catch (e) {
            // JSON parse error - skip
          }
        }
      }
    }

    // テキストからJSON部分を抽出
    let shiftData
    try {
      const jsonMatch = fullText.match(/```json\s*([\s\S]*?)\s*```/) ||
                       fullText.match(/(\{[\s\S]*"shifts"[\s\S]*\})/)

      if (jsonMatch && jsonMatch[1]) {
        // JSONコメントを削除
        let jsonText = jsonMatch[1]
        jsonText = jsonText.replace(/\/\/.*$/gm, '') // 行コメント削除
        jsonText = jsonText.replace(/\/\*[\s\S]*?\*\//g, '') // ブロックコメント削除
        jsonText = jsonText.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '') // 制御文字削除

        shiftData = JSON.parse(jsonText)
      } else {
        throw new Error('レスポンスにJSONデータが見つかりません')
      }
    } catch (parseError) {
      console.error('JSON parse error:', parseError)

      return NextResponse.json({
        success: false,
        error: { message: 'AIからの応答の解析に失敗しました' }
      }, { status: 500 })
    }

    // シフトデータのバリデーション
    if (!shiftData.shifts || !Array.isArray(shiftData.shifts)) {
      return NextResponse.json({
        success: false,
        error: { message: 'シフトデータの形式が正しくありません' }
      }, { status: 500 })
    }

    // バリデーション＆修正
    const validatedShifts = shiftData.shifts.filter((shift: any) => {
      // 必須フィールドチェック
      if (!shift.date || !shift.employee_id) {
        return false
      }

      // 日付の有効性チェック
      const dateStr = shift.date
      const [year, month, day] = dateStr.split('-').map(Number)
      const reconstructedDate = new Date(year, month - 1, day)

      if (
        reconstructedDate.getFullYear() !== year ||
        reconstructedDate.getMonth() !== month - 1 ||
        reconstructedDate.getDate() !== day
      ) {
        return false
      }

      // 従業員の存在チェック
      const employee = employees?.find((emp: Employee) => emp.id === shift.employee_id)
      if (!employee) {
        return false
      }

      // 従業員の勤務可能曜日チェック
      const shiftDate = new Date(shift.date)
      const dayOfWeek = shiftDate.getDay()
      const dayNames = ['日', '月', '火', '水', '木', '金', '土']
      const shiftDayName = dayNames[dayOfWeek]

      if (employee.available_days && !employee.available_days.includes(shiftDayName)) {
        return false
      }

      return true
    })

    // Dify成功後、既存シフトを削除
    const { error: deleteError } = await supabase
      .from('shifts')
      .delete()
      .gte('date', startDate)
      .lte('date', lastDate)

    if (deleteError) {
      console.error('既存シフト削除エラー:', deleteError)
      // 削除エラーでも続行（新規月の場合は削除対象がないため）
    }

    // 新規シフトをデータベースに挿入
    const { error: insertError } = await supabase
      .from('shifts')
      .insert(validatedShifts)

    if (insertError) {
      console.error('シフト挿入エラー:', insertError)
      return NextResponse.json({
        success: false,
        error: { message: 'シフトの保存に失敗しました' }
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: {
        shifts: validatedShifts,
        summary: {
          total_shifts: validatedShifts.length,
          target_month: body.target_month
        }
      }
    })

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '予期しないエラーが発生しました'
    console.error('Error generating shift:', error)
    return NextResponse.json(
      { success: false, error: { message: 'シフト生成中にエラーが発生しました' } },
      { status: 500 }
    )
  }
}
