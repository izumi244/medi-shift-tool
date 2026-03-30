'use client'

import React, { useState } from 'react'
import { CalendarDays, FileText, LogOut, User } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useShiftData } from '@/contexts/ShiftDataContext'
import EmployeeShiftView from './EmployeeShiftView'
import EmployeeLeaveRequest from './EmployeeLeaveRequest'

type EmployeeTab = 'shift' | 'leave'

const EmployeeDashboard: React.FC = () => {
  const { user, logout } = useAuth()
  const { loading } = useShiftData()
  const [activeTab, setActiveTab] = useState<EmployeeTab>('shift')

  const handleLogout = async () => {
    if (confirm('ログアウトしますか？')) {
      await logout()
    }
  }

  const today = new Date()
  const currentDate = today.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })

  const tabs: { id: EmployeeTab; label: string; icon: React.ReactNode }[] = [
    { id: 'shift', label: 'シフト確認', icon: <CalendarDays className="w-5 h-5" /> },
    { id: 'leave', label: '希望休申請', icon: <FileText className="w-5 h-5" /> },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-800">{user?.name || 'スタッフ'}</h1>
                <p className="text-xs text-gray-500">{currentDate}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">ログアウト</span>
            </button>
          </div>
        </div>
      </header>

      {/* Tab Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-[68px] z-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <span className="ml-3 text-gray-500">読み込み中...</span>
          </div>
        ) : (
          <>
            {activeTab === 'shift' && <EmployeeShiftView />}
            {activeTab === 'leave' && <EmployeeLeaveRequest />}
          </>
        )}
      </main>
    </div>
  )
}

export default EmployeeDashboard
