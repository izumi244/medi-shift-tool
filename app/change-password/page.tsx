'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react'

export default function ChangePasswordPage() {
  const router = useRouter()
  const { user, isLoading, logout } = useAuth()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    // 未認証の場合はログインページへ
    if (!isLoading && !user) {
      router.push('/login')
      return
    }

    // すでにパスワード変更済みの場合はホームへ
    if (!isLoading && user && user.password_changed) {
      router.push('/')
    }
  }, [user, isLoading, router])

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  const validatePassword = (password: string): string[] => {
    const errors: string[] = []

    if (password.length < 6) {
      errors.push('パスワードは6文字以上である必要があります')
    }

    if (!/[a-zA-Z]/.test(password)) {
      errors.push('パスワードに英字を含める必要があります')
    }

    if (!/[0-9]/.test(password)) {
      errors.push('パスワードに数字を含める必要があります')
    }

    return errors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // バリデーション
    const validationErrors = validatePassword(newPassword)
    if (validationErrors.length > 0) {
      setError(validationErrors.join('\n'))
      return
    }

    if (newPassword !== confirmPassword) {
      setError('パスワードが一致しません')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employee_number: user?.employee_number,
          new_password: newPassword
        })
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error?.message || 'パスワード変更に失敗しました')
      }

      // パスワード変更成功後、ログアウトして再ログインを促す
      alert('パスワードを変更しました。新しいパスワードで再度ログインしてください。')

      // セッションをクリア
      localStorage.removeItem('session')
      sessionStorage.removeItem('session')

      router.push('/login')
    } catch (err: any) {
      setError(err.message || 'パスワード変更に失敗しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-gray-600">読み込み中...</div>
      </div>
    )
  }

  if (!user || user.password_changed) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-8">
            {/* 戻るボタン */}
            <button
              onClick={handleLogout}
              className="flex items-center text-gray-600 hover:text-gray-800 transition-colors mb-6"
            >
              <ArrowLeft className="w-5 h-5 mr-1" />
              <span className="text-sm">ログアウトして戻る</span>
            </button>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800">パスワード変更</h1>
              <p className="text-gray-600 mt-2">初回ログインのため、パスワードを変更してください</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 新しいパスワード */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                新しいパスワード
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={`w-full pl-10 pr-12 py-3 border-2 rounded-xl focus:ring-2 focus:ring-indigo-200 transition-colors ${
                    error ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-indigo-500'
                  }`}
                  placeholder="新しいパスワード"
                  required
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={isSubmitting}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* パスワード確認 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                パスワード確認
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full pl-10 pr-12 py-3 border-2 rounded-xl focus:ring-2 focus:ring-indigo-200 transition-colors ${
                    error ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-indigo-500'
                  }`}
                  placeholder="パスワードを再入力"
                  required
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={isSubmitting}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* エラーメッセージ */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-700 text-sm whitespace-pre-line">{error}</p>
              </div>
            )}

            {/* パスワード要件 */}
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-indigo-800 mb-2">パスワードの要件</h4>
              <ul className="text-xs text-indigo-700 space-y-1 list-disc list-inside">
                <li>6文字以上</li>
                <li>英字を含む</li>
                <li>数字を含む</li>
              </ul>
            </div>

            {/* 変更ボタン */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:transform-none"
            >
              {isSubmitting ? '変更中...' : 'パスワードを変更'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
