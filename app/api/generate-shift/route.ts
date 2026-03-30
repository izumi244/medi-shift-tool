// app/api/generate-shift/route.ts
// AIシフト自動生成API - Dify Workflow連携

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import type { Employee, Workplace, ShiftPattern, LeaveRequest, AIConstraintGuideline } from '@/types'
import { authenticateRequest, isAdmin } from '@/lib/api-auth'
import { REQUEST_STATUS, NON_WORKING_LEAVE_TYPES } from '@/lib/constants'

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

    if (!isAdmin(user)) {
      return NextResponse.json(
        { success: false, error: { message: 'この操作には管理者権限が必要です' } },
        { status: 403 }
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

    // YYYY-MM形式のバリデーション
    const monthMatch = body.target_month.match(/^(\d{4})-(\d{2})$/)
    if (!monthMatch) {
      return NextResponse.json(
        { success: false, error: { message: '対象月の形式が不正です（YYYY-MM）' } },
        { status: 400 }
      )
    }
    const [, yearStr, monthStr] = monthMatch
    const yearNum = parseInt(yearStr, 10)
    const monthNum = parseInt(monthStr, 10)
    if (monthNum < 1 || monthNum > 12 || yearNum < 2000 || yearNum > 2100) {
      return NextResponse.json(
        { success: false, error: { message: '対象月の値が範囲外です' } },
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
      supabase.from('shift_patterns').select('*').eq('is_active', true).order('created_at', { ascending: false }),
      supabase.from('leave_requests').select('*').gte('date', startDate).lte('date', lastDate).eq('status', REQUEST_STATUS.APPROVED),
      supabase.from('ai_constraint_guidelines').select('*').eq('is_active', true)
    ])

    if (employeesError || workplacesError || patternsError || leavesError || constraintsError) {
      console.error('データ取得エラー:', { employeesError, workplacesError, patternsError, leavesError, constraintsError })
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

    // シフトパターンのID→名前マッピングを作成
    const patternIdToName: Record<string, string> = {}
    if (shiftPatterns) {
      for (const p of shiftPatterns as ShiftPattern[]) {
        patternIdToName[p.id] = p.name
      }
    }

    // 従業員名のID→名前マッピングを作成
    const employeeIdToName: Record<string, string> = {}
    if (employees) {
      for (const e of employees as Employee[]) {
        employeeIdToName[e.id] = e.name
      }
    }

    // AI向けにクリーンなデータを作成（不要フィールドを除去）
    const cleanedEmployees = (employees || []).map((e: Employee) => ({
      id: e.id,
      name: e.name,
      employment_type: e.employment_type,
      job_type: e.job_type,
      available_days: e.available_days,
      assignable_workplaces_by_day: e.assignable_workplaces_by_day,
      day_constraints: e.day_constraints,
      assignable_shift_patterns: (e.assignable_shift_pattern_ids || []).map(
        (pid: string) => patternIdToName[pid] || pid
      ),
    }))

    const cleanedWorkplaces = (workplaces || []).map((w: Workplace) => ({
      id: w.id,
      name: w.name,
      facility: w.facility,
      time_slot: w.time_slot,
      day_of_week: w.day_of_week,
      required_count: w.required_count,
      remarks: w.remarks || null,
    }))

    const cleanedShiftPatterns = (shiftPatterns || []).map((p: ShiftPattern) => ({
      id: p.id,
      name: p.name,
      start_time: p.start_time,
      end_time: p.end_time,
      break_minutes: p.break_minutes,
    }))

    const cleanedLeaveRequests = (leaveRequests || []).map((lr: LeaveRequest) => ({
      employee_id: lr.employee_id,
      employee_name: employeeIdToName[lr.employee_id] || lr.employee_id,
      date: lr.date,
      leave_type: lr.leave_type,
      status: lr.status,
    }))

    // Difyへ送信するデータ
    const difyInputs = {
      target_month: body.target_month,
      calendar: calendarSimple,
      employees: JSON.stringify(cleanedEmployees, null, 2),
      workplaces: JSON.stringify(cleanedWorkplaces, null, 2),
      shift_patterns: JSON.stringify(cleanedShiftPatterns, null, 2),
      leave_requests: JSON.stringify(cleanedLeaveRequests, null, 2),
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
      console.error('Dify APIエラー:', errorText)
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
          } catch (e: unknown) {
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
    } catch (parseError: unknown) {
      console.error('JSONパースエラー:', parseError)

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

    // 休暇日マップを作成（employee_id+date → leave_type）
    const leaveMap = new Map<string, string>()
    if (leaveRequests) {
      for (const lr of leaveRequests as LeaveRequest[]) {
        if ((NON_WORKING_LEAVE_TYPES as readonly string[]).includes(lr.leave_type)) {
          leaveMap.set(`${lr.employee_id}_${lr.date}`, lr.leave_type)
        }
      }
    }

    // 重複チェック用セット（employee_id+date）
    const assignedSet = new Set<string>()

    // バリデーション＆修正
    const dropReasons: Record<string, number> = {
      missing_fields: 0,
      invalid_date: 0,
      out_of_range: 0,
      unknown_employee: 0,
      unavailable_day: 0,
      invalid_pattern: 0,
      invalid_workplace: 0,
      leave_conflict: 0,
      duplicate: 0,
    }

    const validatedShifts = shiftData.shifts.filter((shift: { date?: string; employee_id?: string; shift_pattern_id?: string; [key: string]: unknown }) => {
      // 必須フィールドチェック
      if (!shift.date || !shift.employee_id) {
        dropReasons.missing_fields++
        return false
      }

      // 日付の有効性チェック
      const dateStr = shift.date
      const [sYear, sMonth, sDay] = dateStr.split('-').map(Number)
      const reconstructedDate = new Date(sYear, sMonth - 1, sDay)

      if (
        reconstructedDate.getFullYear() !== sYear ||
        reconstructedDate.getMonth() !== sMonth - 1 ||
        reconstructedDate.getDate() !== sDay
      ) {
        dropReasons.invalid_date++
        return false
      }

      // 対象月範囲チェック
      if (shift.date < startDate || shift.date > lastDate) {
        dropReasons.out_of_range++
        return false
      }

      // 従業員の存在チェック
      const employee = employees?.find((emp: Employee) => emp.id === shift.employee_id)
      if (!employee) {
        dropReasons.unknown_employee++
        return false
      }

      // 従業員の勤務可能曜日チェック
      const shiftDate = new Date(sYear, sMonth - 1, sDay)
      const dayOfWeek = shiftDate.getDay()
      const dayNames = ['日', '月', '火', '水', '木', '金', '土']
      const shiftDayName = dayNames[dayOfWeek]

      if (employee.available_days && !employee.available_days.includes(shiftDayName)) {
        dropReasons.unavailable_day++
        return false
      }

      // shift_pattern_idの従業員許可チェック
      if (shift.shift_pattern_id && employee.assignable_shift_pattern_ids) {
        if (!employee.assignable_shift_pattern_ids.includes(shift.shift_pattern_id)) {
          dropReasons.invalid_pattern++
          return false
        }
      }

      // 配置場所の従業員割り当てチェック（assignable_workplaces_by_day）
      if (employee.assignable_workplaces_by_day && employee.assignable_workplaces_by_day[shiftDayName]) {
        const allowedWorkplaces = employee.assignable_workplaces_by_day[shiftDayName]
        const amWp = shift.am_workplace as string | undefined
        const pmWp = shift.pm_workplace as string | undefined
        if (amWp && allowedWorkplaces.length > 0 && !allowedWorkplaces.includes(amWp)) {
          dropReasons.invalid_workplace++
          return false
        }
        if (pmWp && allowedWorkplaces.length > 0 && !allowedWorkplaces.includes(pmWp)) {
          dropReasons.invalid_workplace++
          return false
        }
      }

      // 休暇日チェック（承認済み休暇の日にシフトを割り当てない）
      const leaveKey = `${shift.employee_id}_${shift.date}`
      if (leaveMap.has(leaveKey)) {
        dropReasons.leave_conflict++
        return false
      }

      // 重複チェック（同一従業員が同一日に複数シフト）
      const dupKey = `${shift.employee_id}_${shift.date}`
      if (assignedSet.has(dupKey)) {
        dropReasons.duplicate++
        return false
      }
      assignedSet.add(dupKey)

      return true
    })

    // 有効なshift_pattern_idのセットを作成
    // クエリで既にis_active=trueフィルタ済み
    const validPatternIds = new Set(
      (shiftPatterns as ShiftPattern[]).map((p: ShiftPattern) => p.id)
    )

    // 配置場所名→IDのマッピングを作成（名前ベースの出力をID参照に変換）
    const workplaceNameToId: Record<string, string> = {}
    if (workplaces) {
      for (const w of workplaces as Workplace[]) {
        // 同名の配置場所が複数ある場合は最初のものを使用
        if (!workplaceNameToId[w.name]) {
          workplaceNameToId[w.name] = w.id
        }
      }
    }

    // DBカラムにマッピング（AIの出力から必要なフィールドのみ抽出）
    const mappedShifts = validatedShifts.map((shift: Record<string, unknown>) => {
      // shift_pattern_idが無効な場合はnullにする（FK違反防止）
      const patternId = shift.shift_pattern_id && validPatternIds.has(shift.shift_pattern_id as string)
        ? shift.shift_pattern_id
        : null

      // 配置場所名からIDを解決（フォールバック: 名前のみ保存）
      const amName = (shift.am_workplace as string) || null
      const pmName = (shift.pm_workplace as string) || null
      const amWorkplaceId = amName ? (workplaceNameToId[amName] || null) : null
      const pmWorkplaceId = pmName ? (workplaceNameToId[pmName] || null) : null

      const shiftRecord: Record<string, unknown> = {
        employee_id: shift.employee_id,
        date: shift.date,
        shift_pattern_id: patternId,
        am_workplace: amName,
        pm_workplace: pmName,
        custom_start_time: shift.custom_start_time || null,
        custom_end_time: shift.custom_end_time || null,
        is_rest: shift.is_rest || false,
        rest_reason: shift.rest_reason || null,
        status: 'draft' as const,
      }
      // DBにworkplace_idカラムが存在する場合のみ含める（マイグレーション済み環境対応）
      if (amWorkplaceId) shiftRecord.am_workplace_id = amWorkplaceId
      if (pmWorkplaceId) shiftRecord.pm_workplace_id = pmWorkplaceId
      return shiftRecord
    })

    if (mappedShifts.length === 0) {
      // AIが有効なシフトを生成できなかった場合は既存シフトを削除しない
      return NextResponse.json({
        success: false,
        error: { message: 'AIが有効なシフトを生成できませんでした' }
      }, { status: 500 })
    }

    // Dify成功後、既存シフトをバックアップしてから削除→挿入
    // Step 1: 既存シフトデータを取得してバックアップ
    const { data: backupShifts, error: backupError } = await supabase
      .from('shifts')
      .select('*')
      .gte('date', startDate)
      .lte('date', lastDate)

    if (backupError) {
      console.error('既存シフトバックアップ取得エラー:', backupError)
      // バックアップ取得に失敗した場合、既存データを保護するためdelete→insertを中止
      return NextResponse.json({
        success: false,
        error: { message: '既存シフトのバックアップ取得に失敗したため、処理を中止しました。再度お試しください。' }
      }, { status: 500 })
    }

    if (backupShifts && backupShifts.length > 0) {
      // バックアップ取得成功（サーバーログ）
    }

    // Step 2: 既存シフトを削除
    const { error: deleteError } = await supabase
      .from('shifts')
      .delete()
      .gte('date', startDate)
      .lte('date', lastDate)

    if (deleteError) {
      console.error('既存シフト削除エラー:', deleteError)
      // 削除エラーでも続行（新規月の場合は削除対象がないため）
    }

    // Step 3: 新規シフトをデータベースに挿入
    const { error: insertError } = await supabase
      .from('shifts')
      .insert(mappedShifts)

    // Step 4: INSERT失敗時はバックアップデータで復元を試みる
    if (insertError) {
      console.error('シフト挿入エラー:', insertError)

      if (backupShifts && backupShifts.length > 0) {
        console.error('バックアップデータからの復元を開始します...')
        const { error: restoreError } = await supabase
          .from('shifts')
          .insert(backupShifts)

        if (restoreError) {
          // Step 5: 復元も失敗した場合
          console.error('バックアップ復元エラー（データ消失の可能性）:', restoreError)
          return NextResponse.json({
            success: false,
            error: {
              message: 'シフトの保存に失敗し、既存データの復元にも失敗しました。管理者に連絡してください。',
              details: {
                insertError: insertError.message,
                restoreError: restoreError.message,
                backupCount: backupShifts.length,
              }
            }
          }, { status: 500 })
        }

        console.error(`バックアップ復元完了: ${backupShifts.length}件を復元しました`)
        return NextResponse.json({
          success: false,
          error: { message: 'シフトの保存に失敗しましたが、既存データを復元しました。再度お試しください。' }
        }, { status: 500 })
      }

      return NextResponse.json({
        success: false,
        error: { message: 'シフトの保存に失敗しました' }
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: {
        shifts: mappedShifts,
        summary: {
          total_generated: shiftData.shifts.length,
          total_valid: validatedShifts.length,
          dropped: shiftData.shifts.length - validatedShifts.length,
          drop_reasons: dropReasons,
          target_month: body.target_month
        }
      }
    })

  } catch (error: unknown) {
    console.error('シフト生成エラー:', error)
    return NextResponse.json(
      { success: false, error: { message: 'シフト生成中にエラーが発生しました' } },
      { status: 500 }
    )
  }
}
