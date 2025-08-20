'use client'

import { useState, ReactNode } from 'react'
import { 
  Users, 
  MapPin, 
  Calendar, 
  Bot, 
  ClipboardList, 
  Rocket,
  Play
} from 'lucide-react'

interface ManagementCard {
  id: string
  icon: ReactNode
  title: string
  description: string
  gradientFrom: string
  gradientTo: string
}

interface StatCard {
  icon: ReactNode
  title: string
  value: string | number
  color: string
}

interface DataInputPageProps {
  onNavigate?: (page: string) => void
}

export default function DataInputPage({ onNavigate }: DataInputPageProps) {
  const [targetMonth, setTargetMonth] = useState('2025-08')
  const [specialRequests, setSpecialRequests] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  // 管理機能カード（統計・レポートを削除）
  const managementCards: ManagementCard[] = [
    {
      id: 'employee',
      icon: <Users className="w-12 h-12" />,
      title: '従業員管理',
      description: '基本情報、対応可能配置、職種制限の設定',
      gradientFrom: 'from-blue-500',
      gradientTo: 'to-blue-600'
    },
    {
      id: 'workplace',
      icon: <MapPin className="w-12 h-12" />,
      title: '配置場所管理',
      description: 'AM/PM分割、14箇所の配置設定',
      gradientFrom: 'from-green-500',
      gradientTo: 'to-green-600'
    },
    {
      id: 'leave',
      icon: <Calendar className="w-12 h-12" />,
      title: '希望休管理',
      description: 'カレンダー表示、申請・編集機能',
      gradientFrom: 'from-purple-500',
      gradientTo: 'to-purple-600'
    },
    {
      id: 'constraints',
      icon: <Bot className="w-12 h-12" />,
      title: 'AI制約条件管理',
      description: '自然言語での制約方針設定',
      gradientFrom: 'from-orange-500',
      gradientTo: 'to-orange-600'
    },
    {
      id: 'shift',
      icon: <ClipboardList className="w-12 h-12" />,
      title: 'シフト表示',
      description: '作成されたシフトの確認・編集',
      gradientFrom: 'from-indigo-500',
      gradientTo: 'to-indigo-600'
    }
  ]

  // 統計カード
  const statCards: StatCard[] = [
    {
      icon: <Users className="w-8 h-8" />,
      title: '登録従業員数',
      value: '15人',
      color: 'text-blue-600'
    },
    {
      icon: <Calendar className="w-8 h-8" />,
      title: '今月の希望休',
      value: '3件',
      color: 'text-green-600'
    },
    {
      icon: <MapPin className="w-8 h-8" />,
      title: '配置場所数',
      value: '14箇所',
      color: 'text-orange-600'
    },
    {
      icon: <Bot className="w-8 h-8" />,
      title: 'AI制約ルール',
      value: '12件',
      color: 'text-purple-600'
    }
  ]

  const handleCardClick = (cardId: string) => {
    if (onNavigate) {
      onNavigate(cardId)
    } else {
      console.log(`Navigate to ${cardId}`)
      alert(`${cardId}ページに遷移します（実装予定）`)
    }
  }

  const handleGenerateShift = async () => {
    if (!targetMonth) {
      alert('対象月を選択してください')
      return
    }

    setIsGenerating(true)
    
    try {
      // AIシフト作成のシミュレーション
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      alert(`${targetMonth}のシフトを作成しました！\n特別要望: ${specialRequests || 'なし'}`)
      
      // シフト表示ページに遷移
      if (onNavigate) {
        onNavigate('shift')
      }
      
    } catch (error) {
      alert('シフト作成中にエラーが発生しました')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* ページヘッダー */}
      <div className="border-b-2 border-gray-100 pb-6">
        <h2 className="text-3xl font-bold text-indigo-600 mb-2 flex items-center gap-3">
          <Rocket className="w-8 h-8" />
          シフト作成
        </h2>
        <p className="text-lg text-gray-600">
          管理機能へのアクセスとシフト作成
        </p>
      </div>

      {/* AIシフト作成セクション */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8 border border-indigo-200">
        <h3 className="text-2xl font-bold text-indigo-700 mb-6 flex items-center gap-3">
          <Bot className="w-7 h-7" />
          AIシフト作成
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              対象月
            </label>
            <input
              type="month"
              value={targetMonth}
              onChange={(e) => setTargetMonth(e.target.value)}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors text-gray-800"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              特別要望
            </label>
            <input
              type="text"
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              placeholder=""
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors text-gray-800"
            />
          </div>
        </div>
        
        <div className="text-center">
          <button
            onClick={handleGenerateShift}
            disabled={isGenerating}
            className={`inline-flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
              isGenerating
                ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
            }`}
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                作成中...
              </>
            ) : (
              <>
                <Play className="w-6 h-6" />
                AIシフト作成開始
              </>
            )}
          </button>
        </div>
      </div>

      {/* 管理機能カード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {managementCards.map((card) => (
          <button
            key={card.id}
            onClick={() => handleCardClick(card.id)}
            className={`group relative overflow-hidden p-8 rounded-2xl bg-gradient-to-br ${card.gradientFrom} ${card.gradientTo} text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 text-left`}
          >
            {/* 背景装飾 */}
            <div className="absolute inset-0 bg-white opacity-10 transform -skew-y-6 group-hover:skew-y-6 transition-transform duration-300"></div>
            
            <div className="relative z-10">
              <div className="mb-4">
                {card.icon}
              </div>
              <h3 className="text-xl font-bold mb-2">{card.title}</h3>
              <p className="text-sm opacity-90 leading-relaxed">
                {card.description}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`${stat.color}`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}