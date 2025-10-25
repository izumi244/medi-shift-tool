// lib/supabase.ts
// Supabaseクライアントの初期化

import { createClient } from '@supabase/supabase-js'

// 環境変数のチェック
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key must be provided in environment variables')
}

// クライアント用Supabaseインスタンス（ブラウザで使用）
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// サーバー用Supabaseインスタンス（API Routesで使用）
export function createServerSupabaseClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!serviceRoleKey) {
    throw new Error('Supabase Service Role Key must be provided for server-side operations')
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}
