'use client'

import { useState } from 'react'
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Filter,
  Save,
  X,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Briefcase
} from 'lucide-react'
import { Employee, EmploymentType, JobType, FacilityType } from '@/types'

export default function EmployeePage() {
  const [employees, setEmployees] = useState<Employee[]>([
    {
      id: '1',
      name: '看護師A',
      employment_type: '常勤',
      job_type: '看護師',
      assignable_facilities: ['クリニック棟', '健診棟'],
      available_days: ['月', '火', '木', '金', '土'],
      phone: '090-1234-5678',
      email: 'nurse-a@clinic.com',
      notes: 'リーダー経験豊富、CF業務可能',
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '2',
      name: '看護師B',
      employment_type: '常勤',
      job_type: '看護師',
      assignable_facilities: ['クリニック棟', '健診棟'],
      available_days: ['月', '火', '木', '金', '土'],
      phone: '090-2345-6789',
      email: 'nurse-b@clinic.com',
      notes: '小児科経験あり',
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '3',
      name: '臨床検査技師A',
      employment_type: '常勤',
      job_type: '臨床検査技師',
      assignable_facilities: ['クリニック棟', '健診棟'],
      available_days: ['月', '火', '木', '金', '土'],
      phone: '090-3456-7890',
      email: 'tech-a@clinic.com',
      notes: '採血業務メイン',
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '4',
      name: 'パート看護師A',
      employment_type: 'パート',
      job_type: '看護師',
      assignable_facilities: ['クリニック棟', '健診棟'],
      available_days: ['月', '火', '水', '木', '金'],
      phone: '090-4567-8901',
      email: 'part-nurse-a@clinic.com',
      notes: '午前中希望',
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  ])

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
    assignable_facilities: [] as FacilityType[],
    available_days: [] as string[],
    phone: '',
    email: '',
    notes: ''
  })

  // 職種制限設定状態
  const [skillSettings, setSkillSettings] = useState({
    cf_direct: { nurse: true, tech: false },
    blood_draw: { nurse: true, tech: true, tech_priority: true },
    desk_work: { nurse: true, tech: true }
  })

  // フィルタリングされた従業員
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchText.toLowerCase())
    const matchesEmploymentType = !filterEmploymentType || employee.employment_type === filterEmploymentType
    const matchesJobType = !filterJobType || employee.job_type === filterJobType
    return matchesSearch && matchesEmploymentType && matchesJobType && employee.is_active
  })

  // モーダルを開く
  const openModal = (employee?: Employee) => {
    if (employee) {
      setEditingEmployee(employee)
      setFormData({
        name: employee.name,
        employment_type: employee.employment_type,
        job_type: employee.job_type,
        assignable_facilities: employee.assignable_facilities,
        available_days: employee.available_days,
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
        assignable_facilities: [],
        available_days: [],
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
    
    if (editingEmployee) {
      // 編集
      setEmployees(prev => prev.map(emp => 
        emp.id === editingEmployee.id
          ? { ...emp, ...formData, updated_at: now }
          : emp
      ))
    } else {
      // 新規追加
      const newEmployee: Employee = {
        id: (employees.length + 1).toString(),
        ...formData,
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

  // チェックボックス配列の更新
  const updateArrayField = (field: 'assignable_facilities' | 'available_days', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'assignable_facilities'
        ? prev[field].includes(value as FacilityType)
          ? prev[field].filter(item => item !== value)
          : [...prev[field], value as FacilityType]
        : prev[field].includes(value)
          ? prev[field].filter(item => item !== value)
          : [...prev[field], value]
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
          従業員の基本情報、対応可能配置場所を管理
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
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">配置可能場所</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">勤務可能曜日</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredEmployees.map((employee) => (
                <tr key={employee.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                        {employee.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{employee.name}</div>
                        {employee.email && (
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {employee.email}
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
                      <span className="text-sm font-medium">{employee.job_type}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {employee.assignable_facilities.map((facility) => (
                        <span key={facility} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-md">
                          {facility}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600">
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

      {/* 職種制限設定 */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
        <h3 className="text-xl font-bold text-indigo-600 mb-4 flex items-center gap-2">
          <Briefcase className="w-6 h-6" />
          職種制限設定（配置場所ごと）
        </h3>
        
        <div className="space-y-6">
          {/* CF中(直接介助) */}
          <div className="bg-red-50 p-4 rounded-xl border border-red-200">
            <h4 className="font-semibold text-red-800 mb-3">CF中(直接介助)</h4>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={skillSettings.cf_direct.nurse}
                  onChange={(e) => setSkillSettings(prev => ({
                    ...prev,
                    cf_direct: { ...prev.cf_direct, nurse: e.target.checked }
                  }))}
                  className="w-4 h-4 text-red-600 border-red-300 rounded focus:ring-red-200"
                />
                <span className="text-sm font-medium">看護師</span>
              </label>
              <label className="flex items-center gap-2 cursor-not-allowed opacity-50">
                <input
                  type="checkbox"
                  checked={false}
                  disabled
                  className="w-4 h-4 text-gray-400 border-gray-300 rounded"
                />
                <span className="text-sm">臨床検査技師（対応不可）</span>
              </label>
            </div>
          </div>

          {/* 処置(採血) */}
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-3">処置(採血)</h4>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={skillSettings.blood_draw.nurse}
                  onChange={(e) => setSkillSettings(prev => ({
                    ...prev,
                    blood_draw: { ...prev.blood_draw, nurse: e.target.checked }
                  }))}
                  className="w-4 h-4 text-blue-600 border-blue-300 rounded focus:ring-blue-200"
                />
                <span className="text-sm font-medium">看護師</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={skillSettings.blood_draw.tech}
                  onChange={(e) => setSkillSettings(prev => ({
                    ...prev,
                    blood_draw: { ...prev.blood_draw, tech: e.target.checked }
                  }))}
                  className="w-4 h-4 text-blue-600 border-blue-300 rounded focus:ring-blue-200"
                />
                <span className="text-sm font-medium">臨床検査技師（優先）</span>
              </label>
            </div>
          </div>

          {/* D(デスク等) */}
          <div className="bg-green-50 p-4 rounded-xl border border-green-200">
            <h4 className="font-semibold text-green-800 mb-3">D(デスク等)</h4>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={skillSettings.desk_work.nurse}
                  onChange={(e) => setSkillSettings(prev => ({
                    ...prev,
                    desk_work: { ...prev.desk_work, nurse: e.target.checked }
                  }))}
                  className="w-4 h-4 text-green-600 border-green-300 rounded focus:ring-green-200"
                />
                <span className="text-sm font-medium">看護師</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={skillSettings.desk_work.tech}
                  onChange={(e) => setSkillSettings(prev => ({
                    ...prev,
                    desk_work: { ...prev.desk_work, tech: e.target.checked }
                  }))}
                  className="w-4 h-4 text-green-600 border-green-300 rounded focus:ring-green-200"
                />
                <span className="text-sm font-medium">臨床検査技師</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* 従業員編集モーダル */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
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
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors"
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
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors"
                  >
                    <option value="常勤">常勤</option>
                    <option value="パート">パート</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    職種 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.job_type}
                    onChange={(e) => setFormData(prev => ({ ...prev, job_type: e.target.value as JobType }))}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors"
                  >
                    <option value="看護師">看護師</option>
                    <option value="臨床検査技師">臨床検査技師</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    電話番号
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors"
                    placeholder="090-1234-5678"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  メールアドレス
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors"
                  placeholder="example@clinic.com"
                />
              </div>

              {/* 配置可能場所 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  配置可能場所 <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-4">
                  {(['クリニック棟', '健診棟'] as FacilityType[]).map((facility) => (
                    <label key={facility} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.assignable_facilities.includes(facility)}
                        onChange={() => updateArrayField('assignable_facilities', facility)}
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-200"
                      />
                      <span className="text-sm font-medium">{facility}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 勤務可能曜日 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  勤務可能曜日 <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-3">
                  {['月', '火', '水', '木', '金', '土', '日'].map((day) => (
                    <label key={day} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.available_days.includes(day)}
                        onChange={() => updateArrayField('available_days', day)}
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-200"
                      />
                      <span className="text-sm font-medium min-w-[24px] text-center">{day}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 備考 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  備考
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors resize-none"
                  placeholder="例：リーダー経験豊富、CF業務可能"
                />
              </div>

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
                  onClick={saveEmployee}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  保存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}