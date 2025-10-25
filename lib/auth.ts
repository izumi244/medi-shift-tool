import { LoginCredentials, User } from '@/types/auth'

// バリデーション関数
export function validateUserId(userId: string): boolean {
  // 小文字ローマ字5文字+数字3桁
  const regex = /^[a-z]{5}[0-9]{3}$/
  return regex.test(userId)
}

export function validatePassword(password: string): boolean {
  // 同じ形式
  return validateUserId(password)
}

// 認証関数（現在はモックデータ）
export async function authenticate(credentials: LoginCredentials): Promise<User | null> {
  // バリデーション
  if (!validateUserId(credentials.user_id) || !validatePassword(credentials.password)) {
    throw new Error('ユーザーIDまたはパスワードの形式が正しくありません')
  }

  // モックユーザーデータ（実装時はSupabase接続）
  const mockUsers: User[] = [
    {
      id: '1',
      user_id: 'admin123',
      name: '管理者',
      role: 'admin',
      created_at: '2025-01-01T00:00:00Z'
    },
    {
      id: '2', 
      user_id: 'nurse456',
      name: '看護師A',
      role: 'employee',
      created_at: '2025-01-01T00:00:00Z'
    },
    {
      id: '3',
      user_id: 'devel789',
      name: '開発者',
      role: 'developer', 
      created_at: '2025-01-01T00:00:00Z'
    }
  ]

  // モック認証（ユーザーIDとパスワードが同じ場合に成功）
  const user = mockUsers.find(u => u.user_id === credentials.user_id)
  if (user && credentials.user_id === credentials.password) {
    return user
  }

  throw new Error('ユーザーIDまたはパスワードが正しくありません')
}

// ログアウト
export async function logout(): Promise<void> {
  // TODO: 実際のAPI呼び出し（Supabase実装時）
  console.log('Logout called')
}
