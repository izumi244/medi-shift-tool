'use client'

import React, { useState } from 'react'
import { 
  Calendar, 
  Plus, 
  Clock, 
  Check, 
  X, 
  Eye,
  Filter,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  XCircle,
  User,
  FileText
} from 'lucide-react'
import { LeaveRequest, Employee, LeaveType, RequestStatus } from '@/types'

export default function LeavePage() {
  const [currentMonth, setCurrentMonth] = useState('2025-08')
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null)
  const [filterStatus, setFilterStatus] = useState<RequestStatus | ''>('')
  const [filterEmployee, setFilterEmployee] = useState('')

  // モックデータ
  const employees: Employee[] = [
    { id: '1', name: '看護師A', employment_type: '常勤', job_type: '看護師', assignable_facilities: ['クリニック棟'], available_days: ['月', '火'], phone: '', email: '', is_active: true, created_at: '', updated_at: '' },
    { id: '2', name: '看護師B', employment_type: '常勤', job_type: '看護師', assignable_facilities: ['クリニック棟'], available_days: ['月', '火'], phone: '', email: '', is_active: true, created_at: '', updated_at: '' },
    { id: '3', name: '臨床検査技師A', employment_type: '常勤', job_type: '臨床検査技師', assignable_facilities: ['健診棟'], available_days: ['月', '火'], phone: '', email: '', is_active: true, created_at: '', updated_at: '' },
    { id: '4', name: 'パート看護師A', employment_type: 'パート', job_type: '看護師', assignable_facilities: ['クリニック棟'], available_days: ['月', '火'], phone: '', email: '', is_active: true, created_at: '', updated_at: '' }
  ]

  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([
    {
      id: '1',
      employee_id: '1',
      date: '2025-08-15',
      leave_type: '希望休',
      reason: '家族の用事',
      status: '申請中',
      created_at: '2025-08-01T09:00:00Z',
      updated_at: '2025-08-01T09:00:00Z'
    },
    {
      id: '2',
      employee_id: '2',
      date: '2025-08-20',
      leave_type: '有休',
      reason: '旅行',
      status: '承認',
      approved_by: 'admin',
      approved_at: '2025-08-02T14:30:00Z',
      created_at: '2025-08-01T10:30:00Z',
      updated_at: '2025-08-02T14:30:00Z'
    },
    {
      id: '3',
      employee_id: '3',
      date: '2025-08-25',
      leave_type: '希望休',
      reason: '私用',
      status: '却下',
      rejection_reason: '人員不足のため',
      created_at: '2025-08-03T08:15:00Z',
      updated_at: '2025-08-03T16:45:00Z'
    },
    {
      id: '4',
      employee_id: '4',
      date: '2025-08-18',
      leave_type: '病欠',
      reason: '体調不良',
      status: '承認',
      approved_by: 'admin',
      approved_at: '2025-08-03T09:00:00Z',
      created_at: '2025-08-03T08:30:00Z',
      updated_at: '2025-08-03T09:00:00Z'
    }
  ])

  // フォーム状態
  const [formData, setFormData] = useState({
    employee_id: '',
    date: '',
    leave_type: '希望休' as LeaveType,
    reason: ''
  })

  // カレンダー用のヘルパー関数
  const getDaysInMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-').map(Number)
    return new Date(year, month, 0).getDate()
  }

  const getFirstDayOfWeek = (monthStr: string) => {
    const [year, month] = monthStr.split('-').map(Number)
    return new Date(year, month - 1, 1).getDay()
  }

  // 従業員名を取得
  const getEmployeeName = (employeeId: string) => {
    return employees.find(emp => emp.id === employeeId)?.name || '不明'
  }

  // 月を変更
  const changeMonth = (direction: 'prev' | 'next') => {
    const [year, month] = currentMonth.split('-').map(Number)
    let newYear = year
    let newMonth = month

    if (direction === 'prev') {
      newMonth -= 1
      if (newMonth === 0) {
        newMonth = 12
        newYear -= 1
      }
    } else {
      newMonth += 1
      if (newMonth === 13) {
        newMonth = 1
        newYear += 1
      }
    }

    setCurrentMonth(`${newYear}-${newMonth.toString().padStart(2, '0')}`)
  }

  // 希望休申請を承認
  const approveLeave = (id: string) => {
    setLeaveRequests(prev => prev.map(leave => 
      leave.id === id 
        ? { 
            ...leave, 
            status: '承認' as RequestStatus, 
            approved_by: 'admin',
            approved_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        : leave
    ))
  }

  // 希望休申請を却下
  const rejectLeave = (id: string, reason: string) => {
    setLeaveRequests(prev => prev.map(leave => 
      leave.id === id 
        ? { 
            ...leave, 
            status: '却下' as RequestStatus, 
            rejection_reason: reason,
            updated_at: new Date().toISOString()
          }
        : leave
    ))
  }

  // 新規申請を追加
  const addLeaveRequest = () => {
    const newRequest: LeaveRequest = {
      id: (leaveRequests.length + 1).toString(),
      ...formData,
      status: '申請中',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    setLeaveRequests(prev => [...prev, newRequest])
    setFormData({
      employee_id: '',
      date: '',
      leave_type: '希望休',
      reason: ''
    })
    setIsModalOpen(false)
  }

  // フィルタリングされた希望休
  const filteredLeaves = leaveRequests.filter(leave => {
    const matchesStatus = !filterStatus || leave.status === filterStatus
    const matchesEmployee = !filterEmployee || getEmployeeName(leave.employee_id).includes(filterEmployee)
    const matchesMonth = leave.date.startsWith(currentMonth)
    return matchesStatus && matchesEmployee && matchesMonth
  })

  // カレンダーのレンダリング用データ
  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth)
    const firstDay = getFirstDayOfWeek(currentMonth)
    const days = []

    // 前月の空の日
    for (let i = 0; i < firstDay; i++) {
      days.push(null)
    }

    // 現在月の日
    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${currentMonth}-${day.toString().padStart(2, '0')}`
      const dayLeaves = filteredLeaves.filter(leave => leave.date === date)
      days.push({ day, date, leaves: dayLeaves })
    }

    return days
  }

  const statusColors = {
    '申請中': { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200', icon: Clock },
    '承認': { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200', icon: CheckCircle2 },
    '却下': { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200', icon: XCircle }
  }

  const leaveTypeColors = {
    '希望休': 'bg-blue-100 text-blue-800',
    '有休': 'bg-green-100 text-green-800',
    '忌引': 'bg-gray-100 text-gray-800',
    '病欠': 'bg-red-100 text-red-800',
    'その他': 'bg-purple-100 text-purple-800'
  }

  return (
    <div className="space-y-6">
      {/* ページヘッダー */}
      <div className="border-b-2 border-gray-100 pb-6">
        <h2 className="text-3xl font-bold text-indigo-600 mb-2 flex items-center gap-3">
          <Calendar className="w-8 h-8" />
          希望休管理
        </h2>
        <p className="text-lg text-gray-600">
          スタッフの希望休申請・承認管理（ベースツールと同じ機能）
        </p>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">申請中</div>
              <div className="text-xl font-bold text-yellow-600">
                {leaveRequests.filter(l => l.status === '申請中').length}件
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
              <div className="text-sm text-gray-600">承認済み</div>
              <div className="text-xl font-bold text-green-600">
                {leaveRequests.filter(l => l.status === '承認').length}件
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">却下</div>
              <div className="text-xl font-bold text-red-600">
                {leaveRequests.filter(l => l.status === '却下').length}件
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">今月合計</div>
              <div className="text-xl font-bold text-blue-600">
                {filteredLeaves.length}件
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 操作バー */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* 表示切り替え・月選択 */}
        <div className="flex items-center gap-4">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                viewMode === 'calendar'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              カレンダー
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              リスト
            </button>
          </div>

          {/* 月選択 */}
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg border border-gray-200">
            <button
              onClick={() => changeMonth('prev')}
              className="p-1 rounded hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <span className="font-semibold text-gray-800 min-w-[100px] text-center">
              {currentMonth.replace('-', '年')}月
            </span>
            <button
              onClick={() => changeMonth('next')}
              className="p-1 rounded hover:bg-gray-100 transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* フィルタ・追加ボタン */}
        <div className="flex items-center gap-4">
          {viewMode === 'list' && (
            <>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as RequestStatus | '')}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors"
              >
                <option value="">ステータス（全て）</option>
                <option value="申請中">申請中</option>
                <option value="承認">承認</option>
                <option value="却下">却下</option>
              </select>

              <input
                type="text"
                placeholder="従業員名で検索"
                value={filterEmployee}
                onChange={(e) => setFilterEmployee(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors"
              />
            </>
          )}

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            <Plus className="w-5 h-5" />
            新規申請
          </button>
        </div>
      </div>

      {/* メインコンテンツ */}
      {viewMode === 'calendar' ? (
        /* カレンダー表示 */
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['日', '月', '火', '水', '木', '金', '土'].map((day) => (
              <div key={day} className="p-3 text-center font-semibold text-gray-600 border-b border-gray-200">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-2">
            {generateCalendarDays().map((dayData, index) => (
              <div key={index} className="min-h-[100px] p-2 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                {dayData && (
                  <>
                    <div className="font-semibold text-gray-800 mb-2">{dayData.day}</div>
                    <div className="space-y-1">
                      {dayData.leaves.map((leave) => {
                        const StatusIcon = statusColors[leave.status].icon
                        return (
                          <div
                            key={leave.id}
                            className={`text-xs p-2 rounded cursor-pointer ${statusColors[leave.status].bg} ${statusColors[leave.status].border} border`}
                            onClick={() => setSelectedLeave(leave)}
                            title={`${getEmployeeName(leave.employee_id)} - ${leave.leave_type}`}
                          >
                            <div className="flex items-center gap-1">
                              <StatusIcon className="w-3 h-3" />
                              <span className="font-medium truncate">{getEmployeeName(leave.employee_id)}</span>
                            </div>
                            <div className="text-xs opacity-75 truncate">{leave.leave_type}</div>
                          </div>
                        )
                      })}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* リスト表示 */
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">申請日</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">従業員</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">希望日</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">種類</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">理由</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">ステータス</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredLeaves.map((leave) => {
                  const StatusIcon = statusColors[leave.status].icon
                  return (
                    <tr key={leave.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(leave.created_at).toLocaleDateString('ja-JP')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {getEmployeeName(leave.employee_id).charAt(0)}
                          </div>
                          <span className="font-medium text-gray-900">{getEmployeeName(leave.employee_id)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                        {new Date(leave.date).toLocaleDateString('ja-JP')}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${leaveTypeColors[leave.leave_type]}`}>
                          {leave.leave_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-[200px] truncate">
                        {leave.reason}
                      </td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${statusColors[leave.status].bg} ${statusColors[leave.status].text}`}>
                          <StatusIcon className="w-4 h-4" />
                          {leave.status}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedLeave(leave)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="詳細"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {leave.status === '申請中' && (
                            <>
                              <button
                                onClick={() => approveLeave(leave.id)}
                                className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                                title="承認"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  const reason = prompt('却下理由を入力してください:')
                                  if (reason) rejectLeave(leave.id, reason)
                                }}
                                className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                title="却下"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 新規申請モーダル */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-indigo-600">新規希望休申請</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  従業員 <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.employee_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, employee_id: e.target.value }))}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors"
                >
                  <option value="">選択してください</option>
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.name} ({employee.job_type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  希望日 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  種類 <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.leave_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, leave_type: e.target.value as LeaveType }))}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors"
                >
                  <option value="希望休">希望休</option>
                  <option value="有休">有休</option>
                  <option value="忌引">忌引</option>
                  <option value="病欠">病欠</option>
                  <option value="その他">その他</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  理由
                </label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                  rows={3}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors resize-none"
                  placeholder="例：家族の用事、旅行など"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors"
                >
                  キャンセル
                </button>
                <button
                  type="button"
                  onClick={addLeaveRequest}
                  disabled={!formData.employee_id || !formData.date}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 text-white rounded-xl font-semibold transition-all duration-300"
                >
                  申請
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 詳細表示モーダル */}
      {selectedLeave && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-indigo-600">希望休詳細</h3>
              <button
                onClick={() => setSelectedLeave(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">従業員</label>
                  <div className="p-3 bg-gray-50 rounded-lg font-medium">
                    {getEmployeeName(selectedLeave.employee_id)}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">希望日</label>
                  <div className="p-3 bg-gray-50 rounded-lg font-medium">
                    {new Date(selectedLeave.date).toLocaleDateString('ja-JP')}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">種類</label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${leaveTypeColors[selectedLeave.leave_type]}`}>
                      {selectedLeave.leave_type}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">ステータス</label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${statusColors[selectedLeave.status].bg} ${statusColors[selectedLeave.status].text}`}>
                      {React.createElement(statusColors[selectedLeave.status].icon, { className: "w-4 h-4" })}
                      {selectedLeave.status}
                    </div>
                  </div>
                </div>
              </div>

              {selectedLeave.reason && (
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">理由</label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    {selectedLeave.reason}
                  </div>
                </div>
              )}

              {selectedLeave.rejection_reason && (
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">却下理由</label>
                  <div className="p-3 bg-red-50 rounded-lg text-red-700">
                    {selectedLeave.rejection_reason}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
                <div>
                  <label className="block font-semibold mb-1">申請日時</label>
                  <div>{new Date(selectedLeave.created_at).toLocaleString('ja-JP')}</div>
                </div>
                <div>
                  <label className="block font-semibold mb-1">更新日時</label>
                  <div>{new Date(selectedLeave.updated_at).toLocaleString('ja-JP')}</div>
                </div>
              </div>

              {selectedLeave.status === '申請中' && (
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      const reason = prompt('却下理由を入力してください:')
                      if (reason) {
                        rejectLeave(selectedLeave.id, reason)
                        setSelectedLeave(null)
                      }
                    }}
                    className="flex-1 py-3 px-4 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <X className="w-5 h-5" />
                    却下
                  </button>
                  <button
                    onClick={() => {
                      approveLeave(selectedLeave.id)
                      setSelectedLeave(null)
                    }}
                    className="flex-1 py-3 px-4 bg-green-100 hover:bg-green-200 text-green-700 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <Check className="w-5 h-5" />
                    承認
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}