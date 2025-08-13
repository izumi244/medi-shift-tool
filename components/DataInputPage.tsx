'use client'

import { useState, ReactNode } from 'react'
import { 
  Users, 
  MapPin, 
  Calendar, 
  Bot, 
  ClipboardList, 
  BarChart3,
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

export default function DataInputPage() {
  const [targetMonth, setTargetMonth] = useState('2025-08')
  const [specialRequests, setSpecialRequests] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  // 管理機能カード
  const managementCards: ManagementCard[] = [
    {
      id: 'employee',
      icon: <Users className="w-12 h-12" />,
      title: '従業員管理',
      description: '従業員の基本情報、対応可能配置場所を管理',
      gradientFrom: 'from-blue-500',
      gradientTo: 'to-blue-600'
    },
    {
      id: 'workplace',
      icon: <MapPin className="w-12 h-12" />,
      title: '配置場所管理',
      description: '配置場所を管理',
      gradientFrom: 'from-green-500',
      gradientTo: 'to-green-600'
    },
    {
      id: 'leave',
      icon: <Calendar className="w-12 h-12" />,
      title: '希望休管理',
      description: 'スタッフの希望休申請・承認管理',
      gradientFrom: 'from-purple-500',
      gradientTo: 'to-purple-600'
    },
    {
      id: 'constraints',
      icon: <Bot className="w-12 h-12" />,
      title: '制約管理',
      description: '自然言語でシフト生成の制約条件を設定',
      gradientFrom: 'from-orange-500',
      gradientTo: 'to-orange-600'
    },
    {
      id: 'shift',
      icon: <ClipboardList className="w-12 h-12" />,
      title: 'シフト表示',
      description: '生成されたシフトの確認・編集',
      gradientFrom: 'from-indigo-500',
      gradientTo: 'to-indigo-600'
    },
    {
      id: 'statistics',
      icon: <BarChart3 className="w-12 h-12" />,
      title: '統計・レポート',
      description: '勤務時間統計、制約違反チェック',
      gradientFrom: 'from-pink-500',
      gradientTo: 'to-pink-600'
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
    // ページ遷移の処理（後で実装）
    console.log(`Navigate to ${cardId}`)
    alert(`${cardId}ページに遷移します（実装予定）`)
  }

  const handleGenerateShift = async () => {
    if (!targetMonth) {
      alert('対象月を選択してください')
      return
    }

    setIsGenerating(true)
    
    try {
      // AIシフト生成のシミュレーション
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      alert(`${targetMonth}のシフトを生成しました！\n特別要望: ${specialRequests || 'なし'}`)
      
      // シフト表示ページに遷移（後で実装）
      console.log('Navigate to shift display page')
      
    } catch (error) {
      alert('シフト生成中にエラーが発生しました')
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
          シフト生成
        </h2>
        <p className="text-lg text-gray-600">
          管理機能へのアクセスとシフト生成
        </p>
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

      {/* AIシフト生成セクション */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8 border border-indigo-200">
        <h3 className="text-2xl font-bold text-indigo-700 mb-6 flex items-center gap-3">
          <Bot className="w-7 h-7" />
          AIシフト生成
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
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors"
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
              placeholder="例：お盆期間は人員多めに配置"
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors"
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
                <div className="w-6 h-6 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                生成中...
              </>
            ) : (
              <>
                <Play className="w-6 h-6" />
                AIシフト生成開始
              </>
            )}
          </button>
        </div>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-2xl border-2 border-gray-100 hover:border-indigo-200 hover:shadow-lg transition-all duration-300 group"
          >
            <div className="flex items-center gap-4">
              <div className={`${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                {stat.icon}
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-600 mb-1">
                  {stat.title}
                </h4>
                <p className={`text-2xl font-bold ${stat.color}`}>
                  {stat.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 最近の活動 */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          📋 最近の活動
        </h3>
        
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-700">
              <strong>看護師A</strong>さんが希望休を申請しました
            </span>
            <span className="text-xs text-gray-500 ml-auto">2時間前</span>
          </div>
          
          <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-sm text-gray-700">
              2025年7月のシフトが確定されました
            </span>
            <span className="text-xs text-gray-500 ml-auto">1日前</span>
          </div>
          
          <div className="flex items-center gap-3 p-3 rounded-lg bg-orange-50 border border-orange-200">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            <span className="text-sm text-gray-700">
              新しい制約ルール「妊娠中配慮」が追加されました
            </span>
            <span className="text-xs text-gray-500 ml-auto">3日前</span>
          </div>
        </div>
      </div>
    </div>
  )
}