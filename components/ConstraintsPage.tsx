'use client'

import { useState } from 'react'
import { 
  Bot, 
  Plus, 
  Edit, 
  Trash2, 
  Save,
  X,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Users,
  Settings,
  Filter,
  Search,
  ArrowUp,
  ArrowDown,
  Lightbulb
} from 'lucide-react'
import { AIConstraintGuideline } from '@/types'

export default function ConstraintsPage() {
  const [constraints, setConstraints] = useState<AIConstraintGuideline[]>([
    {
      id: '1',
      category: '労働時間制限',
      constraint_content: '6時間以上勤務する場合は45分以上の休憩時間を確保してください。8時間以上の場合は1時間の休憩を確保してください。',
      priority_level: 10,
      examples: '8:30-17:30勤務の場合、12:00-12:45で45分休憩',
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '2',
      category: '職種制限',
      constraint_content: 'CF中(直接介助)は看護師のみが対応可能です。臨床検査技師は配置しないでください。',
      priority_level: 10,
      examples: 'CF中の配置には臨床検査技師は配置しない',
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '3',
      category: '妊娠中配慮',
      constraint_content: '妊娠中のスタッフは重い作業や長時間の立ち仕事を避けてください。デスク業務を優先的に配置してください。',
      priority_level: 8,
      examples: '妊娠中の看護師はデスク業務を優先する',
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '4',
      category: '新人指導',
      constraint_content: '新人スタッフは経験者とペアで配置してください。一人での対応は避けてください。',
      priority_level: 7,
      examples: '新人看護師と経験豊富な看護師を同じ時間帯に配置',
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '5',
      category: '休憩回し',
      constraint_content: '昼休憩は11:00-14:00の間で順番に回してください。同じ時間帯に複数人が休憩に入らないよう配慮してください。',
      priority_level: 8,
      examples: '看護師Aが11:30-12:15、看護師Bが12:15-13:00',
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '6',
      category: '水曜日制限',
      constraint_content: '水曜日はクリニック棟が休診のため、健診棟のみの配置としてください。',
      priority_level: 10,
      examples: '水曜日はクリニック棟の全配置場所を使用しない',
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '7',
      category: '連続勤務制限',
      constraint_content: '同じスタッフが3日以上連続で勤務しないよう配慮してください。適切な休息期間を確保してください。',
      priority_level: 7,
      examples: '月火水と連続勤務した場合、木曜日は休みにする',
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  ])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingConstraint, setEditingConstraint] = useState<AIConstraintGuideline | null>(null)
  const [searchText, setSearchText] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterPriority, setFilterPriority] = useState<number | ''>('')

  // フォーム状態
  const [formData, setFormData] = useState({
    category: '',
    constraint_content: '',
    priority_level: 5,
    examples: ''
  })

  // カテゴリ一覧を取得
  const categories = Array.from(new Set(constraints.map(c => c.category)))

  // フィルタリングされた制約
  const filteredConstraints = constraints.filter(constraint => {
    const matchesSearch = constraint.constraint_content.toLowerCase().includes(searchText.toLowerCase()) ||
                         constraint.category.toLowerCase().includes(searchText.toLowerCase())
    const matchesCategory = !filterCategory || constraint.category === filterCategory
    const matchesPriority = filterPriority === '' || constraint.priority_level >= filterPriority
    return matchesSearch && matchesCategory && matchesPriority && constraint.is_active
  }).sort((a, b) => b.priority_level - a.priority_level) // 優先度順でソート

  // モーダルを開く
  const openModal = (constraint?: AIConstraintGuideline) => {
    if (constraint) {
      setEditingConstraint(constraint)
      setFormData({
        category: constraint.category,
        constraint_content: constraint.constraint_content,
        priority_level: constraint.priority_level,
        examples: constraint.examples || ''
      })
    } else {
      setEditingConstraint(null)
      setFormData({
        category: '',
        constraint_content: '',
        priority_level: 5,
        examples: ''
      })
    }
    setIsModalOpen(true)
  }

  // モーダルを閉じる
  const closeModal = () => {
    setIsModalOpen(false)
    setEditingConstraint(null)
  }

  // 制約を保存
  const saveConstraint = () => {
    const now = new Date().toISOString()
    
    if (editingConstraint) {
      // 編集
      setConstraints(prev => prev.map(constraint => 
        constraint.id === editingConstraint.id
          ? { ...constraint, ...formData, updated_at: now }
          : constraint
      ))
    } else {
      // 新規追加
      const newConstraint: AIConstraintGuideline = {
        id: (constraints.length + 1).toString(),
        ...formData,
        is_active: true,
        created_at: now,
        updated_at: now
      }
      setConstraints(prev => [...prev, newConstraint])
    }
    
    closeModal()
  }

  // 制約を削除
  const deleteConstraint = (id: string) => {
    if (confirm('この制約ルールを削除しますか？')) {
      setConstraints(prev => prev.map(constraint => 
        constraint.id === id ? { ...constraint, is_active: false } : constraint
      ))
    }
  }

  // 優先度の色分け
  const getPriorityColor = (priority: number) => {
    if (priority >= 9) return { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200', badge: 'bg-red-500' }
    if (priority >= 7) return { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200', badge: 'bg-orange-500' }
    if (priority >= 5) return { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200', badge: 'bg-yellow-500' }
    return { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200', badge: 'bg-gray-500' }
  }

  // カテゴリのアイコン
  const getCategoryIcon = (category: string) => {
    const iconMap: Record<string, string> = {
      '労働時間制限': '⏰',
      '職種制限': '👔',
      '妊娠中配慮': '🤱',
      '新人指導': '📚',
      '休憩回し': '☕',
      '水曜日制限': '📅',
      '連続勤務制限': '🔄'
    }
    return iconMap[category] || '📝'
  }

  // サンプル制約テンプレート
  const constraintTemplates = [
    {
      category: '緊急時対応',
      content: '緊急時には経験豊富なスタッフを必ず配置してください。新人のみの配置は避けてください。',
      priority: 9,
      examples: '救急対応が必要な場合、ベテラン看護師を配置'
    },
    {
      category: '機器メンテナンス',
      content: '機器メンテナンス日は該当エリアへの配置を避けてください。',
      priority: 6,
      examples: 'エコー機器メンテナンス日はエコー担当者を他業務に配置'
    },
    {
      category: '研修・教育',
      content: '研修参加者は当日の業務負荷を軽減してください。',
      priority: 5,
      examples: '外部研修参加日は軽業務のみに配置'
    }
  ]

  return (
    <div className="space-y-6">
      {/* ページヘッダー */}
      <div className="border-b-2 border-gray-100 pb-6">
        <h2 className="text-3xl font-bold text-indigo-600 mb-2 flex items-center gap-3">
          <Bot className="w-8 h-8" />
          制約管理
        </h2>
        <p className="text-lg text-gray-600">
          自然言語でシフト生成の制約条件を設定
        </p>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">最高優先度</div>
              <div className="text-xl font-bold text-red-600">
                {constraints.filter(c => c.priority_level >= 9 && c.is_active).length}件
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <ArrowUp className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">高優先度</div>
              <div className="text-xl font-bold text-orange-600">
                {constraints.filter(c => c.priority_level >= 7 && c.priority_level < 9 && c.is_active).length}件
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Settings className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">総制約数</div>
              <div className="text-xl font-bold text-blue-600">
                {constraints.filter(c => c.is_active).length}件
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">カテゴリ数</div>
              <div className="text-xl font-bold text-green-600">
                {categories.length}種類
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 検索・フィルタ・追加ボタン */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col md:flex-row gap-4 flex-1">
          {/* 検索 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="制約内容で検索..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="pl-10 pr-4 py-2 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors w-full md:w-64"
            />
          </div>

          {/* フィルタ */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors"
          >
            <option value="">カテゴリ（全て）</option>
            {categories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value === '' ? '' : parseInt(e.target.value))}
            className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors"
          >
            <option value="">優先度（全て）</option>
            <option value={9}>最高（9-10）</option>
            <option value={7}>高（7-8）</option>
            <option value={5}>中（5-6）</option>
            <option value={1}>低（1-4）</option>
          </select>
        </div>

        {/* 追加ボタン */}
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
        >
          <Plus className="w-5 h-5" />
          新しい制約を追加
        </button>
      </div>

      {/* 制約一覧 */}
      <div className="space-y-4">
        {filteredConstraints.map((constraint) => {
          const priorityColor = getPriorityColor(constraint.priority_level)
          return (
            <div
              key={constraint.id}
              className={`bg-white p-6 rounded-2xl border-l-4 ${priorityColor.border} border border-gray-200 shadow-sm hover:shadow-md transition-shadow`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{getCategoryIcon(constraint.category)}</span>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${priorityColor.bg} ${priorityColor.text}`}>
                        {constraint.category}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${priorityColor.badge}`}></div>
                        <span className="text-sm font-medium text-gray-600">
                          優先度: {constraint.priority_level}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-gray-900 text-base leading-relaxed mb-3">
                    {constraint.constraint_content}
                  </div>

                  {constraint.examples && (
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2 mb-1">
                        <Lightbulb className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-semibold text-blue-800">例</span>
                      </div>
                      <div className="text-sm text-blue-700">
                        {constraint.examples}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => openModal(constraint)}
                    className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors"
                    title="編集"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => deleteConstraint(constraint.id)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                    title="削除"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* テンプレート提案 */}
      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-200">
        <h3 className="text-xl font-bold text-purple-700 mb-4 flex items-center gap-2">
          <Lightbulb className="w-6 h-6" />
          制約テンプレート提案
        </h3>
        <p className="text-purple-600 mb-4">
          よく使われる制約パターンです。クリックして簡単に追加できます。
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {constraintTemplates.map((template, index) => (
            <div
              key={index}
              className="bg-white p-4 rounded-xl border border-purple-200 hover:border-purple-300 cursor-pointer transition-colors"
              onClick={() => {
                setFormData({
                  category: template.category,
                  constraint_content: template.content,
                  priority_level: template.priority,
                  examples: template.examples
                })
                setEditingConstraint(null)
                setIsModalOpen(true)
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{getCategoryIcon(template.category)}</span>
                <span className="font-semibold text-purple-800">{template.category}</span>
              </div>
              <div className="text-sm text-gray-600 mb-2">
                {template.content.slice(0, 80)}...
              </div>
              <div className="text-xs text-purple-600">
                優先度: {template.priority}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 制約編集モーダル */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-indigo-600">
                {editingConstraint ? '制約ルール編集' : '新しい制約ルール追加'}
              </h3>
              <button
                onClick={closeModal}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    制約カテゴリ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors"
                    placeholder="例：新人指導、休憩回し、特別対応"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    優先度レベル <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.priority_level}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority_level: parseInt(e.target.value) }))}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors"
                  >
                    <option value={10}>10 (最高) - 絶対遵守</option>
                    <option value={9}>9 (最高) - 法的要件</option>
                    <option value={8}>8 (高) - 安全性重要</option>
                    <option value={7}>7 (高) - 業務効率重要</option>
                    <option value={6}>6 (中) - 推奨</option>
                    <option value={5}>5 (中) - 標準</option>
                    <option value={4}>4 (低) - 軽微</option>
                    <option value={3}>3 (低) - 任意</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  制約内容（自然言語で記述） <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.constraint_content}
                  onChange={(e) => setFormData(prev => ({ ...prev, constraint_content: e.target.value }))}
                  rows={4}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors resize-none"
                  placeholder="例：新人スタッフは経験者とペアで配置してください。一人での対応は避けてください。"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  具体例・補足説明
                </label>
                <textarea
                  value={formData.examples}
                  onChange={(e) => setFormData(prev => ({ ...prev, examples: e.target.value }))}
                  rows={3}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors resize-none"
                  placeholder="例：新人看護師と経験豊富な看護師を同じ時間帯に配置"
                />
              </div>

              {/* プレビュー */}
              {formData.constraint_content && (
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <h4 className="font-semibold text-gray-800 mb-2">プレビュー</h4>
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getPriorityColor(formData.priority_level).bg} ${getPriorityColor(formData.priority_level).text}`}>
                      {formData.category || '未設定'}
                    </span>
                    <span className="text-sm text-gray-600">
                      優先度: {formData.priority_level}
                    </span>
                  </div>
                  <div className="text-gray-900 mb-2">
                    {formData.constraint_content}
                  </div>
                  {formData.examples && (
                    <div className="bg-blue-50 p-2 rounded border border-blue-200">
                      <span className="text-xs font-semibold text-blue-800">例: </span>
                      <span className="text-xs text-blue-700">{formData.examples}</span>
                    </div>
                  )}
                </div>
              )}

              {/* ボタン */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors"
                >
                  キャンセル
                </button>
                <button
                  type="button"
                  onClick={saveConstraint}
                  disabled={!formData.category || !formData.constraint_content}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 text-white rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  {editingConstraint ? '更新' : '追加'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}