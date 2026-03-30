'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import AuthGuard from '@/components/AuthGuard'
import MainLayout from '@/components/MainLayout'
import EmployeeDashboard from '@/components/employee/EmployeeDashboard'

export default function HomePage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // 認証されていない場合、ログインページにリダイレクト
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
      return
    }

    // パスワード未変更の場合、パスワード変更ページにリダイレクト
    if (!isLoading && isAuthenticated && user && !user.password_changed) {
      router.push('/change-password')
    }
  }, [user, isAuthenticated, isLoading, router])

  // ローディング中またはリダイレクト中
  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  // 従業員ロールの場合は専用ダッシュボードを表示
  if (user?.role === 'employee') {
    return (
      <AuthGuard>
        <EmployeeDashboard />
      </AuthGuard>
    )
  }

  // 管理者・開発者の場合は従来のレイアウトを表示
  return (
    <AuthGuard>
      <MainLayout />
    </AuthGuard>
  )
}
