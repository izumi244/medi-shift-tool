// scripts/setup-existing-employees.ts
// 既存従業員にアカウント（employee_number, password_hash）を付与するスクリプト

import { hashPassword, generatePassword, formatEmployeeNumber } from '../lib/auth'
import { createServerSupabaseClient } from '../lib/supabase'
import * as fs from 'fs'
import * as path from 'path'

interface EmployeeAccount {
  id: string
  name: string
  employee_number: string
  initial_password: string
}

async function setupExistingEmployees() {
  try {
    console.log('=== 既存従業員へのアカウント付与開始 ===\n')

    const supabase = createServerSupabaseClient()

    // 1. employee_numberがNULLの従業員を取得
    const { data: employees, error: fetchError } = await supabase
      .from('employees')
      .select('id, name')
      .is('employee_number', null)
      .eq('is_active', true)
      .order('created_at', { ascending: true })

    if (fetchError) throw fetchError

    if (!employees || employees.length === 0) {
      console.log('✅ アカウント付与が必要な従業員はいません')
      return
    }

    console.log(`📋 対象従業員: ${employees.length}人\n`)

    // 2. 現在のemployee_sequences番号を取得
    const { data: sequenceData, error: seqError } = await supabase
      .from('employee_sequences')
      .select('last_number')
      .eq('id', 1)
      .single()

    if (seqError) throw seqError

    let currentNumber = sequenceData?.last_number || 0

    // 3. 各従業員にアカウントを付与
    const accounts: EmployeeAccount[] = []

    for (const employee of employees) {
      currentNumber++
      const employeeNumber = formatEmployeeNumber(currentNumber)
      const password = generatePassword()
      const hashedPassword = await hashPassword(password)

      console.log(`処理中: ${employee.name}`)
      console.log(`  従業員番号: ${employeeNumber}`)
      console.log(`  パスワード: ${password}`)

      // DBを更新
      const { error: updateError } = await supabase
        .from('employees')
        .update({
          employee_number: employeeNumber,
          password_hash: hashedPassword,
          password_changed: false, // 初回ログイン時にパスワード変更を求める
          updated_at: new Date().toISOString()
        })
        .eq('id', employee.id)

      if (updateError) {
        console.error(`  ❌ エラー:`, updateError)
        throw updateError
      }

      console.log(`  ✅ 完了\n`)

      accounts.push({
        id: employee.id,
        name: employee.name,
        employee_number: employeeNumber,
        initial_password: password
      })
    }

    // 4. employee_sequencesを更新
    const { error: updateSeqError } = await supabase
      .from('employee_sequences')
      .update({
        last_number: currentNumber,
        updated_at: new Date().toISOString()
      })
      .eq('id', 1)

    if (updateSeqError) throw updateSeqError

    console.log(`📊 employee_sequences更新: last_number = ${currentNumber}\n`)

    // 5. CSV出力
    const csvContent = [
      'id,氏名,従業員番号,初期パスワード',
      ...accounts.map(acc => `${acc.id},"${acc.name}",${acc.employee_number},${acc.initial_password}`)
    ].join('\n')

    const outputDir = path.join(process.cwd(), 'output')
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
    const csvPath = path.join(outputDir, `employee-accounts-${timestamp}.csv`)
    fs.writeFileSync(csvPath, csvContent, 'utf-8')

    console.log('=== セットアップ完了 ===')
    console.log(`✅ ${accounts.length}人のアカウントを作成しました`)
    console.log(`📄 アカウント情報を保存しました: ${csvPath}\n`)
    console.log('⚠️  CSVファイルは安全に保管してください（パスワードが含まれています）')
  } catch (error) {
    console.error('❌ エラーが発生しました:', error)
    throw error
  }
}

// スクリプト実行
setupExistingEmployees()
  .then(() => {
    console.log('\nスクリプトが正常に完了しました')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\nスクリプトが失敗しました:', error)
    process.exit(1)
  })
