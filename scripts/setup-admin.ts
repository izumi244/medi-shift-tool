// scripts/setup-admin.ts
// admin123アカウントを作成するスクリプト

import { hashPassword } from '../lib/auth'
import { createServerSupabaseClient } from '../lib/supabase'

async function setupAdminAccount() {
  try {
    console.log('=== admin123アカウント作成開始 ===')

    const supabase = createServerSupabaseClient()

    // admin123のパスワードをハッシュ化
    const hashedPassword = await hashPassword('admin123')
    console.log('パスワードハッシュ化完了')

    // admin123アカウントを作成（is_active: false で非表示）
    const { data, error } = await supabase
      .from('employees')
      .insert({
        name: '開発者',
        employment_type: '常勤',
        job_type: '看護師',
        employee_number: 'admin123',
        password_hash: hashedPassword,
        password_changed: true,
        is_system_account: true,
        is_active: false, // UIに表示しない
        assignable_workplaces_by_day: {},
        assignable_shift_pattern_ids: [],
        day_constraints: [],
        available_days: []
      })
      .select()
      .single()

    if (error) {
      // 既に存在する場合は更新
      if (error.code === '23505') { // unique violation
        console.log('admin123アカウントが既に存在します。更新します...')

        const { data: updatedData, error: updateError } = await supabase
          .from('employees')
          .update({
            name: '開発者',
            password_hash: hashedPassword,
            password_changed: true,
            is_system_account: true,
            is_active: false
          })
          .eq('employee_number', 'admin123')
          .select()
          .single()

        if (updateError) {
          throw updateError
        }

        console.log('✅ admin123アカウント更新完了')
        console.log('従業員番号: admin123')
        console.log('パスワード: admin123')
        console.log('名前: 開発者')
        console.log('is_active: false (UIに表示されません)')
      } else {
        throw error
      }
    } else {
      console.log('✅ admin123アカウント作成完了')
      console.log('従業員番号: admin123')
      console.log('パスワード: admin123')
      console.log('名前: 開発者')
      console.log('is_active: false (UIに表示されません)')
    }

    console.log('\n=== セットアップ完了 ===')
  } catch (error) {
    console.error('❌ エラーが発生しました:', error)
    throw error
  }
}

// スクリプト実行
setupAdminAccount()
  .then(() => {
    console.log('\nスクリプトが正常に完了しました')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\nスクリプトが失敗しました:', error)
    process.exit(1)
  })
