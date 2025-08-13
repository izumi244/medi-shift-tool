'use client'

import React, { useState, ReactNode } from 'react'
import { 
  Users, 
  MapPin, 
  Calendar, 
  Bot, 
  ClipboardList, 
  Rocket,
  BookOpen,
  HelpCircle,
  Download,
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

// ページコンポーネントのインポート
import DataInputPage from './DataInputPage'
import EmployeePage from './EmployeePage'
import WorkplacePage from './WorkplacePage'
import LeavePage from './LeavePage'
import ConstraintsPage from './ConstraintsPage'
import ShiftPage from './ShiftPage'

interface LayoutProps {
  children?: ReactNode
}

type PageType = 'dataInput' | 'employee' | 'workplace' | 'leave' | 'constraints' | 'shift'

interface MenuItem {
  id: PageType
  icon: ReactNode
  title: string
  description: string
}

interface User {
  name: string
  role: string
  avatar: string
}

export default function MainLayout({ children }: LayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [currentPage, setCurrentPage] = useState<PageType>('dataInput')

  // ページコンポーネントをレンダリング
  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dataInput':
        return <DataInputPage />
      case 'employee':
        return <EmployeePage />
      case 'workplace':
        return <WorkplacePage />
      case 'leave':
        return <LeavePage />
      case 'constraints':
        return <ConstraintsPage />
      case 'shift':
        return <ShiftPage />
      default:
        return <DataInputPage />
    }
  }

  // ユーザー情報
  const user: User = {
    name: '管理者',
    role: 'admin',
    avatar: '👑'
  }

  // メニュー項目
  const menuItems: MenuItem[] = [
    {
      id: 'dataInput',
      icon: <Rocket className="w-5 h-5" />,
      title: 'シフト生成',
      description: ''
    },
    {
      id: 'employee',
      icon: <Users className="w-5 h-5" />,
      title: '従業員管理',
      description: ''
    },
    {
      id: 'workplace',
      icon: <MapPin className="w-5 h-5" />,
      title: '配置場所管理',
      description: ''
    },
    {
      id: 'leave',
      icon: <Calendar className="w-5 h-5" />,
      title: '希望休管理',
      description: ''
    },
    {
      id: 'constraints',
      icon: <Bot className="w-5 h-5" />,
      title: '制約管理',
      description: ''
    },
    {
      id: 'shift',
      icon: <ClipboardList className="w-5 h-5" />,
      title: 'シフト表示',
      description: ''
    }
  ]

  // システムメニュー
  const systemItems = [
    { icon: <BookOpen className="w-4 h-4" />, title: '操作マニュアル' },
    { icon: <HelpCircle className="w-4 h-4" />, title: 'ヘルプ・サポート' },
    { icon: <Download className="w-4 h-4" />, title: 'データエクスポート' }
  ]

  // プログレスステップ
  const progressSteps = [
    { id: 'employee', label: '従業員管理' },
    { id: 'workplace', label: '配置場所管理' },
    { id: 'leave', label: '希望休管理' },
    { id: 'constraints', label: '制約管理' },
    { id: 'shift', label: 'シフト表示' }
  ]

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
  }

  const handlePageChange = (pageId: PageType) => {
    setCurrentPage(pageId)
  }

  // プログレスバーの計算
  const currentStepIndex = progressSteps.findIndex(step => step.id === currentPage)
  const progressPercentage = currentStepIndex >= 0 ? (currentStepIndex / (progressSteps.length - 1)) * 100 : 0

  // 現在の日付
  const today = new Date()
  const currentDate = today.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-purple-700">
      <div className="flex min-h-screen">
        {/* サイドバー */}
        <div className={`bg-white shadow-xl transition-all duration-300 ease-in-out flex flex-col ${
          isCollapsed ? 'w-20' : 'w-64'
        } rounded-r-3xl`}>
          
          {/* ユーザー情報エリア */}
          <div className="p-5 border-b-2 border-gray-100">
            <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-lg font-bold">
                {user.avatar}
              </div>
              {!isCollapsed && (
                <div className="flex-1">
                  <div className="font-bold text-gray-800 text-sm">{user.name}</div>
                  <div className="text-xs text-gray-500">{user.role}</div>
                </div>
              )}
            </div>
          </div>

          {/* 折りたたみボタン */}
          <div className="p-4 flex justify-end">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              {isCollapsed ? 
                <ChevronRight className="w-5 h-5 text-gray-600" /> : 
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              }
            </button>
          </div>

          {/* メニューエリア */}
          <div className="flex-1 overflow-y-auto p-2">
            <div className="mb-8">
              {!isCollapsed && (
                <div className="px-3 mb-4">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    メイン機能
                  </h3>
                </div>
              )}
              
              <ul className="space-y-1">
                {menuItems.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => handlePageChange(item.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 text-left ${
                        currentPage === item.id
                          ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                          : 'text-gray-700 hover:bg-gray-100 hover:translate-x-1'
                      }`}
                    >
                      <span className="flex-shrink-0">
                        {item.icon}
                      </span>
                      {!isCollapsed && (
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm truncate">
                            {item.title}
                          </div>
                          <div className="text-xs opacity-80 truncate">
                            {item.description}
                          </div>
                        </div>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* システムメニュー */}
            <div className="border-t border-gray-200 pt-6">
              {!isCollapsed && (
                <div className="px-3 mb-4">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    システム
                  </h3>
                </div>
              )}
              
              <ul className="space-y-1">
                {systemItems.map((item, index) => (
                  <li key={index}>
                    <button className="w-full flex items-center gap-3 p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors duration-200 text-left">
                      <span className="flex-shrink-0">
                        {item.icon}
                      </span>
                      {!isCollapsed && (
                        <span className="text-sm">{item.title}</span>
                      )}
                    </button>
                  </li>
                ))}
                
                {/* ログアウト */}
                <li className="border-t border-gray-200 pt-3 mt-3">
                  <button className="w-full flex items-center gap-3 p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors duration-200 text-left">
                    <LogOut className="w-4 h-4 flex-shrink-0" />
                    {!isCollapsed && (
                      <span className="text-sm">ログアウト</span>
                    )}
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* メインコンテンツエリア */}
        <div className="flex-1 flex flex-col p-5">
          {/* ヘッダー */}
          <div className="bg-white rounded-2xl p-6 mb-5 shadow-lg">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                🏥 シフト作成ツール
              </h1>
              <div className="text-right text-gray-600">
                <div className="text-sm mb-1">{currentDate}</div>
                <div className="text-xs text-indigo-600 font-medium">管理者モード</div>
              </div>
            </div>
          </div>

          {/* プログレスバー */}
          <div className="bg-white rounded-2xl p-6 mb-5 shadow-lg">
            <div className="text-sm font-semibold text-gray-700 mb-4">
              シフト作成プロセス
            </div>
            <div className="flex items-center justify-between relative">
              <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 rounded-full transform -translate-y-1/2"></div>
              <div 
                className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transform -translate-y-1/2 transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              ></div>
              
              {progressSteps.map((step, index) => (
                <div key={index} className="flex flex-col items-center z-10 bg-white px-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mb-2 transition-all duration-300 ${
                    index < currentStepIndex 
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
                      : index === currentStepIndex
                      ? 'bg-white border-3 border-indigo-500 text-indigo-600'
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="text-xs font-medium text-gray-600 text-center max-w-20">
                    {step.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* メインコンテンツ */}
          <div className="bg-white rounded-2xl p-8 flex-1 shadow-lg overflow-y-auto">
            {children || renderCurrentPage()}
          </div>
        </div>
      </div>
    </div>
  )
}