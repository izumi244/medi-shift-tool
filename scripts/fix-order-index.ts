// scripts/fix-order-index.ts
// 重複しているorder_indexを修正するスクリプト

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function fixOrderIndex() {
  console.log('従業員のorder_indexを修正中...')

  // 全ての従業員を取得（created_at順）
  const { data: employees, error: fetchError } = await supabase
    .from('employees')
    .select('id, name, order_index, created_at')
    .eq('is_active', true)
    .order('order_index', { ascending: true })
    .order('created_at', { ascending: true })

  if (fetchError) {
    console.error('従業員の取得に失敗:', fetchError)
    return
  }

  console.log(`${employees.length}人の従業員を取得しました`)

  // 各従業員にorder_indexを順番に振り直す
  for (let i = 0; i < employees.length; i++) {
    const employee = employees[i]
    const newOrderIndex = i + 1

    console.log(`${employee.name}: order_index ${employee.order_index} → ${newOrderIndex}`)

    const { error: updateError } = await supabase
      .from('employees')
      .update({ order_index: newOrderIndex })
      .eq('id', employee.id)

    if (updateError) {
      console.error(`従業員 ${employee.name} の更新に失敗:`, updateError)
    }
  }

  console.log('完了！')

  // 確認のため、更新後のデータを表示
  const { data: updatedEmployees } = await supabase
    .from('employees')
    .select('id, name, order_index')
    .eq('is_active', true)
    .order('order_index', { ascending: true })

  console.log('\n更新後の従業員一覧:')
  updatedEmployees?.forEach(emp => {
    console.log(`${emp.order_index}: ${emp.name}`)
  })
}

fixOrderIndex().catch(console.error)
