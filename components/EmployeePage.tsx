'use client'

import { useState } from 'react'
import { 
  Users, 
  Plus, 
  Search,
  Edit, 
  Trash2, 
  Save,
  X,
  Phone,
  Mail,
  Calendar,
  MapPin
} from 'lucide-react'
import { Employee, EmploymentType, JobType, FacilityType } from '@/types'

export default function EmployeePage() {
  // 従業員データ
  const [employees, setEmployees] = useState<Employee[]>([
    {
      id: '1',
      name: '看護師A',
      employment_type: '常勤',
      job_type: '看護師',
      assignable_facilities: ['クリニック棟', '健診棟'],
      assignable_workplaces_by_day: {
        '月曜日': ['D', '処', 'CF外', 'CF中', 'CF洗浄', '健診G'],
        '火曜日': ['D', '処', 'CF外', 'CF中', 'CF洗浄', '健診G'],
        '木曜日': ['D', '処', 'CF外', 'CF中', 'CF洗浄', '健診G'],
        '金曜日': ['D', '処', 'CF外', 'CF中', 'CF洗浄', '健診G'],
        '土曜日': ['D', '処', 'CF外', 'CF中', 'CF洗浄', '健診G']
      },
      available_days: ['月曜日', '火曜日', '木曜日', '金曜日', '土曜日'],
      phone: '090-1234-5678',
      email: 'nurse-a@example.com',
      notes: '経験豊富、CF中も対応可能',
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '2',
      name: '看護師B',
      employment_type: '常勤',
      job_type: '看護師',
      assignable_facilities: ['クリニック棟'],
      assignable_workplaces_by_day: {
        '月曜日': ['D', '処'],
        '火曜日': ['D', '処'],
        '水曜日': [], // 水曜日はクリニック棟休診
        '木曜日': ['D', '処'],
        '金曜日': ['D', '処']
      },
      available_days: ['月曜日', '火曜日', '水曜日', '木曜日', '金曜日'],
      phone: '090-2345-6789',
      email: 'nurse-b@example.com',
      notes: 'エコー得意',
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '3',
      name: 'パート看護師A',
      employment_type: 'パート',
      job_type: '看護師',
      assignable_facilities: ['クリニック棟'],
      assignable_workplaces_by_day: {
        '月曜日': ['D', '処'],
        '火曜日': ['D', '処'],
        '木曜日': ['D', '処'],
        '金曜日': ['D', '処']
      },
      available_days: ['月曜日', '火曜日', '木曜日', '金曜日'],
      phone: '090-3456-7890',
      email: 'part-nurse-a@example.com',
      notes: '午前中メイン、処置得意',
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '4',
      name: '臨床検査技師A',
      employment_type: '常勤',
      job_type: '臨床検査技師',
      assignable_facilities: ['健診棟'],
      assignable_workplaces_by_day: {
        '月曜日': ['健診G', '健診'],
        '火曜日': ['健診G', '健診'],
        '水曜日': ['健診G', '健診'],
        '木曜日': ['健診G', '健診'],
        '金曜日': ['健診G', '健診'],
        '土曜日': ['健診G', '健診']
      },
      available_days: ['月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'],
      phone: '090-4567-8901',
      email: 'tech-a@example.com',
      notes: '健診業務専門、エコー対応可',
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  ])

  // WorkplacePage管理の配置場所一覧（曜日別・実際の配置場所を参照）
  // 型定義を明確化
  type AvailableWorkplacesByDay = Record<string, Record<string, string[]>>
  
  const availableWorkplacesByDay: AvailableWorkplacesByDay = {
    '月曜日': {
      'クリニック棟': ['D', '処', 'CF外', 'CF中'],
      '健診棟': ['CF洗浄', '健診G', '健診']
    },
    '火曜日': {
      'クリニック棟': ['D', '処', 'CF外', 'CF中'],
      '健診棟': ['CF洗浄', '健診G', '健診']
    },
    '水曜日': {
      'クリニック棟': [], // 休診
      '健診棟': ['健診G', '健診']
    },
    '木曜日': {
      'クリニック棟': ['D', '処', 'CF外', 'CF中'],
      '健診棟': ['CF洗浄', '健診G', '健診']
    },
    '金曜日': {
      'クリニック棟': ['D', '処', 'CF外', 'CF中'],
      '健診棟': ['CF洗浄', '健診G', '健診']
    },
    '土曜日': {
      'クリニック棟': ['D', '処', 'CF外', 'CF中'],
      '健診棟': ['CF洗浄', '健診G', '健診']
    }
  }

  // 状態管理
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [searchText, setSearchText] = useState('')
  const [filterEmploymentType, setFilterEmploymentType] = useState<EmploymentType | ''>('')
  const [filterJobType, setFilterJobType] = useState<JobType | ''>('')

  // フォーム状態
  const [formData, setFormData] = useState({
    name: '',
    employment_type: '常勤' as EmploymentType,
    job_type: '看護師' as JobType,
    assignable_workplaces_by_day: {} as Record<string, string[]>, // 曜日別配置可能場所（メイン）
    phone: '',
    email: '',
    notes: ''
  })

  // フィルタリングされた従業員
  const filteredEmployees = employees.filter(employee => {
    if (!employee.is_active) return false
    
    const matchesSearch = employee.name.toLowerCase().includes(searchText.toLowerCase())
    const matchesEmploymentType = !filterEmploymentType || employee.employment_type === filterEmploymentType
    const matchesJobType = !filterJobType || employee.job_type === filterJobType
    
    return matchesSearch && matchesEmploymentType && matchesJobType
  })

  // モーダルを開く
  const openModal = (employee?: Employee) => {
    if (employee) {
      setEditingEmployee(employee)
      setFormData({
        name: employee.name,
        employment_type: employee.employment_type,
        job_type: employee.job_type,
        assignable_workplaces_by_day: employee.assignable_workplaces_by_day || {}, // undefined対応
        phone: employee.phone || '',
        email: employee.email || '',
        notes: employee.notes || ''
      })
    } else {
      setEditingEmployee(null)
      setFormData({
        name: '',
        employment_type: '常勤',
        job_type: '看護師',
        assignable_workplaces_by_day: {}, // 曜日別配置場所のみ
        phone: '',
        email: '',
        notes: ''
      })
    }
    setIsModalOpen(true)
  }

  // モーダルを閉じる
  const closeModal = () => {
    setIsModalOpen(false)
    setEditingEmployee(null)
  }

  // 従業員を保存
  const saveEmployee = () => {
    const now = new Date().toISOString()
    
    // 曜日別配置場所から自動的に勤務可能曜日と配置可能施設を計算
    const available_days = Object.keys(formData.assignable_workplaces_by_day).filter(
      day => formData.assignable_workplaces_by_day[day].length > 0
    )
    
    const assignable_facilities = Array.from(new Set(
      available_days.flatMap(day => 
        Object.keys(availableWorkplacesByDay[day] || {}).filter(facility =>
          formData.assignable_workplaces_by_day[day].some((workplace: string) =>
            (availableWorkplacesByDay[day][facility] || []).includes(workplace)
          )
        )
      )
    )) as FacilityType[]
    
    const employeeData = {
      ...formData,
      available_days,
      assignable_facilities
    }
    
    if (editingEmployee) {
      // 編集
      setEmployees(prev => prev.map(emp => 
        emp.id === editingEmployee.id
          ? { ...emp, ...employeeData, updated_at: now }
          : emp
      ))
    } else {
      // 新規追加
      const newEmployee: Employee = {
        id: (employees.length + 1).toString(),
        ...employeeData,
        is_active: true,
        created_at: now,
        updated_at: now
      }
      setEmployees(prev => [...prev, newEmployee])
    }
    
    closeModal()
  }

  // 従業員を削除
  const deleteEmployee = (id: string) => {
    if (confirm('この従業員を削除しますか？')) {
      setEmployees(prev => prev.map(emp => 
        emp.id === id ? { ...emp, is_active: false } : emp
      ))
    }
  }

  // 曜日別配置場所の更新
  const updateWorkplaceByDay = (day: string, workplace: string) => {
    setFormData(prev => ({
      ...prev,
      assignable_workplaces_by_day: {
        ...prev.assignable_workplaces_by_day,
        [day]: prev.assignable_workplaces_by_day[day]?.includes(workplace)
          ? prev.assignable_workplaces_by_day[day].filter((w: string) => w !== workplace)
          : [...(prev.assignable_workplaces_by_day[day] || []), workplace]
      }
    }))
  }

  const employmentTypeColors = {
    '常勤': 'bg-blue-100 text-blue-800 border-blue-200',
    'パート': 'bg-purple-100 text-purple-800 border-purple-200'
  }

  const jobTypeIcons = {
    '看護師': '🩺',
    '臨床検査技師': '🔬'
  }

  return (
    <div className="space-y-6">
      {/* ページヘッダー */}
      <div className="border-b-2 border-gray-100 pb-6">
        <h2 className="text-3xl font-bold text-indigo-600 mb-2 flex items-center gap-3">
          <Users className="w-8 h-8" />
          従業員管理
        </h2>
        <p className="text-lg text-gray-600">
          従業員の基本情報と曜日別配置可能場所を管理
        </p>
      </div>

      {/* 検索・フィルタ・追加ボタン */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col md:flex-row gap-4 flex-1">
          {/* 検索 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="従業員名で検索..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="pl-10 pr-4 py-2 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors w-full md:w-64"
            />
          </div>

          {/* フィルタ */}
          <select
            value={filterEmploymentType}
            onChange={(e) => setFilterEmploymentType(e.target.value as EmploymentType | '')}
            className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors"
          >
            <option value="">雇用形態（全て）</option>
            <option value="常勤">常勤</option>
            <option value="パート">パート</option>
          </select>

          <select
            value={filterJobType}
            onChange={(e) => setFilterJobType(e.target.value as JobType | '')}
            className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors"
          >
            <option value="">職種（全て）</option>
            <option value="看護師">看護師</option>
            <option value="臨床検査技師">臨床検査技師</option>
          </select>
        </div>

        {/* 追加ボタン */}
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
        >
          <Plus className="w-5 h-5" />
          新規従業員追加
        </button>
      </div>

      {/* 従業員一覧テーブル */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">氏名</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">雇用形態</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">職種</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">配置設定</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">勤務可能曜日</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredEmployees.map((employee) => (
                <tr key={employee.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {employee.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{employee.name}</div>
                        {employee.phone && (
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {employee.phone}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${employmentTypeColors[employee.employment_type]}`}>
                      {employee.employment_type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{jobTypeIcons[employee.job_type]}</span>
                      <span className="font-medium text-gray-900">{employee.job_type}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      {/* 施設表示 */}
                      <div className="flex flex-wrap gap-1">
                        {employee.assignable_facilities.map((facility) => (
                          <span
                            key={facility}
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              facility === 'クリニック棟' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {facility === 'クリニック棟' ? '🏢' : '🔬'} {facility}
                          </span>
                        ))}
                      </div>
                      {/* 曜日別配置場所の設定数表示 */}
                      {employee.assignable_workplaces_by_day && Object.keys(employee.assignable_workplaces_by_day).length > 0 && (
                        <div className="text-xs text-gray-600">
                          📅 {Object.keys(employee.assignable_workplaces_by_day).filter(day => 
                            (employee.assignable_workplaces_by_day?.[day] || []).length > 0
                          ).length}曜日設定済み
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {employee.available_days.join('・')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openModal(employee)}
                        className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors"
                        title="編集"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteEmployee(employee.id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                        title="削除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 従業員編集モーダル */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-indigo-600">
                {editingEmployee ? '従業員編集' : '新規従業員追加'}
              </h3>
              <button
                onClick={closeModal}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form className="space-y-6">
              {/* 基本情報 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    氏名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors bg-white text-gray-900"
                    placeholder="例：看護師A"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    雇用形態 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.employment_type}
                    onChange={(e) => setFormData(prev => ({ ...prev, employment_type: e.target.value as EmploymentType }))}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors bg-white text-gray-900"
                  >
                    <option value="常勤">常勤</option>
                    <option value="パート">パート</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  職種 <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.job_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, job_type: e.target.value as JobType }))}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors bg-white text-gray-900"
                >
                  <option value="看護師">🩺 看護師</option>
                  <option value="臨床検査技師">🔬 臨床検査技師</option>
                </select>
              </div>

              {/* 連絡先情報 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    電話番号
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors bg-white text-gray-900"
                    placeholder="090-1234-5678"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    メールアドレス
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors bg-white text-gray-900"
                    placeholder="example@hospital.com"
                  />
                </div>
              </div>

              {/* 曜日別配置可能場所 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  曜日別配置可能場所 <span className="text-red-500">*</span>
                </label>
                <p className="text-sm text-gray-600 mb-4">
                  各曜日で配置可能な場所を選択してください。選択した曜日が勤務可能曜日、選択した施設が配置可能施設として自動設定されます。
                </p>
                <div className="space-y-4 max-h-80 overflow-y-auto">
                  {['月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'].map((day) => (
                    <div key={day} className="border-2 border-gray-200 rounded-xl p-4">
                      <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                        📅 {day}
                        {day === '水曜日' && (
                          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                            クリニック棟休診
                          </span>
                        )}
                      </h4>
                      <div className="space-y-3">
                        {Object.entries(availableWorkplacesByDay[day] || {}).map(([facility, workplaces]) => {
                          if (workplaces.length === 0) return null
                          
                          return (
                            <div key={facility} className="border border-gray-200 rounded-lg p-3">
                              <h5 className="font-medium text-sm text-gray-700 mb-2 flex items-center gap-2">
                                <span className="text-lg">
                                  {facility === 'クリニック棟' ? '🏢' : '🔬'}
                                </span>
                                {facility}
                              </h5>
                              <div className="grid grid-cols-2 gap-2">
                                {workplaces.map((workplace) => (
                                  <label key={workplace} className="flex items-center gap-2 p-2 border border-gray-200 rounded cursor-pointer hover:border-indigo-300 transition-colors">
                                    <input
                                      type="checkbox"
                                      checked={formData.assignable_workplaces_by_day[day]?.includes(workplace) || false}
                                      onChange={() => updateWorkplaceByDay(day, workplace)}
                                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-200"
                                    />
                                    <span className="text-sm font-medium text-gray-900">{workplace}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 備考 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  備考・特記事項
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors resize-none bg-white text-gray-900"
                />
              </div>

              {/* ボタン */}
              <div className="flex items-center gap-3 pt-4">
                <button
                  type="button"
                  onClick={saveEmployee}
                  className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-colors"
                >
                  <Save className="w-5 h-5" />
                  保存
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                >
                  キャンセル
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}