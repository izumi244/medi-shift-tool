'use client'

import React, { useState, useMemo, useCallback } from 'react'
import {
  FileText,
  Plus,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  Trash2,
  X,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useShiftData } from '@/contexts/ShiftDataContext'
import type { LeaveRequest, LeaveType, RequestStatus } from '@/types'
import { statusColors, leaveTypeColors } from '@/lib/colors'
import { REQUEST_STATUS, LEAVE_TYPES } from '@/lib/constants'

const EmployeeLeaveRequest: React.FC = () => {
  const { user } = useAuth()
  const { employees, leaveRequests, addLeaveRequest, deleteLeaveRequest } = useShiftData()

  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date()
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
  })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null)

  // Form state
  const [formDates, setFormDates] = useState<string[]>([])
  const [formLeaveType, setFormLeaveType] = useState<LeaveType>(LEAVE_TYPES.HOPE_REST)
  const [formReason, setFormReason] = useState('')

  // Current employee ID
  const currentEmployeeId = useMemo(() => {
    return employees.find(emp => emp.employee_number === user?.employee_number)?.id || ''
  }, [employees, user?.employee_number])

  // My leave requests for the current month
  const myLeaveRequests = useMemo(() => {
    return leaveRequests
      .filter(l => l.employee_id === currentEmployeeId && l.date.startsWith(currentMonth))
      .sort((a, b) => a.date.localeCompare(b.date))
  }, [leaveRequests, currentEmployeeId, currentMonth])

  // Stats
  const stats = useMemo(() => {
    const myAll = leaveRequests.filter(l => l.employee_id === currentEmployeeId)
    return {
      pending: myAll.filter(l => l.status === REQUEST_STATUS.PENDING).length,
      approved: myAll.filter(l => l.status === REQUEST_STATUS.APPROVED).length,
      rejected: myAll.filter(l => l.status === REQUEST_STATUS.REJECTED).length,
      thisMonth: myLeaveRequests.length,
    }
  }, [leaveRequests, currentEmployeeId, myLeaveRequests])

  const changeMonth = (direction: 'prev' | 'next') => {
    const [y, m] = currentMonth.split('-').map(Number)
    const date = new Date(y, m - 1 + (direction === 'prev' ? -1 : 1), 1)
    const newMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    setCurrentMonth(newMonth)
  }

  // Calendar date picking
  const calendarYear = parseInt(currentMonth.split('-')[0])
  const calendarMonth = parseInt(currentMonth.split('-')[1])
  const daysInMonth = new Date(calendarYear, calendarMonth, 0).getDate()
  const firstDayOfWeek = new Date(calendarYear, calendarMonth - 1, 1).getDay()

  const calendarDays = useMemo(() => {
    const result: (number | null)[] = []
    for (let i = 0; i < firstDayOfWeek; i++) result.push(null)
    for (let d = 1; d <= daysInMonth; d++) result.push(d)
    return result
  }, [firstDayOfWeek, daysInMonth])

  const getDateString = (day: number) => {
    return `${calendarYear}-${String(calendarMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  const toggleDateSelection = (day: number) => {
    const dateStr = getDateString(day)
    setFormDates(prev =>
      prev.includes(dateStr) ? prev.filter(d => d !== dateStr) : [...prev, dateStr]
    )
  }

  const getDayLeaveRequest = useCallback((day: number): LeaveRequest | undefined => {
    const dateStr = `${calendarYear}-${String(calendarMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return myLeaveRequests.find(l => l.date === dateStr)
  }, [myLeaveRequests, calendarYear, calendarMonth])

  const openModal = () => {
    setFormDates([])
    setFormLeaveType(LEAVE_TYPES.HOPE_REST)
    setFormReason('')
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
  }

  const handleSubmit = async () => {
    if (!currentEmployeeId || formDates.length === 0) return
    setIsSaving(true)
    try {
      // Submit all requests in parallel
      await Promise.all(
        formDates.map(date =>
          addLeaveRequest({
            employee_id: currentEmployeeId,
            date,
            leave_type: formLeaveType,
            reason: formReason || undefined,
            status: REQUEST_STATUS.PENDING as RequestStatus,
          })
        )
      )
      closeModal()
    } catch (error) {
      const message = error instanceof Error ? error.message : '申請の送信に失敗しました'
      alert(message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('この申請を取り消しますか？')) return
    try {
      await deleteLeaveRequest(id)
      setSelectedLeave(null)
    } catch (error) {
      const message = error instanceof Error ? error.message : '削除に失敗しました'
      alert(message)
    }
  }

  const getStatusIcon = (status: RequestStatus) => {
    switch (status) {
      case REQUEST_STATUS.PENDING: return <Clock className="w-4 h-4 text-yellow-600" />
      case REQUEST_STATUS.APPROVED: return <CheckCircle2 className="w-4 h-4 text-green-600" />
      case REQUEST_STATUS.REJECTED: return <XCircle className="w-4 h-4 text-red-600" />
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <FileText className="w-6 h-6 text-indigo-600" />
          希望休申請
        </h2>
        <button
          onClick={openModal}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all text-sm"
        >
          <Plus className="w-4 h-4" />
          新規申請
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-4 h-4 text-yellow-600" />
            </div>
            <div>
              <div className="text-xs text-gray-500">申請中</div>
              <div className="text-lg font-bold text-yellow-600">{stats.pending}件</div>
            </div>
          </div>
        </div>
        <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <div className="text-xs text-gray-500">承認済み</div>
              <div className="text-lg font-bold text-green-600">{stats.approved}件</div>
            </div>
          </div>
        </div>
        <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle className="w-4 h-4 text-red-600" />
            </div>
            <div>
              <div className="text-xs text-gray-500">却下</div>
              <div className="text-lg font-bold text-red-600">{stats.rejected}件</div>
            </div>
          </div>
        </div>
        <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <div className="text-xs text-gray-500">今月合計</div>
              <div className="text-lg font-bold text-indigo-600">{stats.thisMonth}件</div>
            </div>
          </div>
        </div>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-center gap-3">
        <button onClick={() => changeMonth('prev')} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <span className="font-semibold text-gray-800 min-w-[120px] text-center">
          {currentMonth.replace('-', '年')}月
        </span>
        <button onClick={() => changeMonth('next')} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Calendar showing existing requests */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['日', '月', '火', '水', '木', '金', '土'].map(d => (
            <div key={d} className="text-center text-xs font-semibold text-gray-500 py-1">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, idx) => {
            if (day === null) return <div key={idx} />

            const leave = getDayLeaveRequest(day)
            const today = new Date()
            const isToday = calendarYear === today.getFullYear() && calendarMonth === today.getMonth() + 1 && day === today.getDate()

            return (
              <div
                key={idx}
                onClick={() => leave && setSelectedLeave(leave)}
                className={`min-h-[52px] p-1 rounded-lg text-center transition-colors ${
                  leave ? 'cursor-pointer hover:ring-2 hover:ring-indigo-300' : ''
                } ${isToday ? 'ring-2 ring-indigo-400' : ''}`}
              >
                <div className={`text-xs font-medium mb-0.5 ${isToday ? 'text-indigo-600 font-bold' : 'text-gray-700'}`}>
                  {day}
                </div>
                {leave && (
                  <div className={`text-[9px] px-1 py-0.5 rounded ${statusColors[leave.status].bg} ${statusColors[leave.status].text} font-medium leading-tight`}>
                    {leave.leave_type === LEAVE_TYPES.AVAILABLE ? '出勤可' : leave.leave_type}
                    <div className="text-[8px] opacity-75">{leave.status}</div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Request List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
          <h3 className="font-semibold text-gray-700 text-sm">申請一覧 ({myLeaveRequests.length}件)</h3>
        </div>
        {myLeaveRequests.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">
            この月の申請はありません
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {myLeaveRequests.map(leave => {
              const StatusIcon = statusColors[leave.status].icon
              return (
                <div
                  key={leave.id}
                  className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full ${statusColors[leave.status].bg} ${statusColors[leave.status].border} border`}>
                      <StatusIcon className={`w-3.5 h-3.5 ${statusColors[leave.status].text}`} />
                      <span className={`text-xs font-medium ${statusColors[leave.status].text}`}>{leave.status}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-800">
                        {new Date(leave.date).toLocaleDateString('ja-JP', { month: 'long', day: 'numeric', weekday: 'short' })}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-xs px-1.5 py-0.5 rounded ${leaveTypeColors[leave.leave_type]}`}>
                          {leave.leave_type}
                        </span>
                        {leave.reason && (
                          <span className="text-xs text-gray-500 truncate">{leave.reason}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  {leave.status === REQUEST_STATUS.PENDING && (
                    <button
                      onClick={() => handleDelete(leave.id)}
                      className="ml-2 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                      title="取り消し"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* New Request Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl p-5 w-full sm:max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-bold text-indigo-600">新規申請</h3>
              <button
                onClick={closeModal}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Leave type selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">種類</label>
                <div className="grid grid-cols-3 gap-2">
                  {([LEAVE_TYPES.HOPE_REST, LEAVE_TYPES.PAID_LEAVE, LEAVE_TYPES.FUNERAL, LEAVE_TYPES.SICK_LEAVE, LEAVE_TYPES.OTHER] as LeaveType[]).map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormLeaveType(type)}
                      className={`py-2 px-3 rounded-lg text-sm font-medium border-2 transition-colors ${
                        formLeaveType === type
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date picker calendar */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  希望日を選択 <span className="text-red-500">*</span>
                  {formDates.length > 0 && (
                    <span className="text-indigo-600 ml-2">({formDates.length}日選択中)</span>
                  )}
                </label>

                {/* Month nav inside modal */}
                <div className="flex items-center justify-center gap-3 mb-3">
                  <button onClick={() => changeMonth('prev')} className="p-1 rounded hover:bg-gray-100">
                    <ChevronLeft className="w-4 h-4 text-gray-600" />
                  </button>
                  <span className="text-sm font-semibold text-gray-700">
                    {currentMonth.replace('-', '年')}月
                  </span>
                  <button onClick={() => changeMonth('next')} className="p-1 rounded hover:bg-gray-100">
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                  </button>
                </div>

                <div className="border border-gray-200 rounded-xl p-3">
                  <div className="grid grid-cols-7 gap-1 mb-1">
                    {['日', '月', '火', '水', '木', '金', '土'].map(d => (
                      <div key={d} className="text-center text-[10px] font-semibold text-gray-400 py-1">{d}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {calendarDays.map((day, idx) => {
                      if (day === null) return <div key={idx} />
                      const dateStr = getDateString(day)
                      const isSelected = formDates.includes(dateStr)
                      const existingLeave = getDayLeaveRequest(day)
                      const isPast = new Date(dateStr) < new Date(new Date().toDateString())

                      return (
                        <button
                          key={idx}
                          type="button"
                          disabled={!!existingLeave || isPast}
                          onClick={() => toggleDateSelection(day)}
                          className={`h-9 rounded-lg text-sm font-medium transition-all ${
                            isSelected
                              ? 'bg-indigo-600 text-white shadow-md'
                              : existingLeave
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : isPast
                              ? 'text-gray-300 cursor-not-allowed'
                              : 'text-gray-700 hover:bg-indigo-50'
                          }`}
                        >
                          {day}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Selected dates list */}
                {formDates.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {formDates.sort().map(d => (
                      <span
                        key={d}
                        className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full text-xs font-medium"
                      >
                        {new Date(d).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
                        <button
                          type="button"
                          onClick={() => setFormDates(prev => prev.filter(x => x !== d))}
                          className="hover:text-indigo-900"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Reason */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">理由（任意）</label>
                <textarea
                  value={formReason}
                  onChange={(e) => setFormReason(e.target.value)}
                  rows={2}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors resize-none text-gray-800 text-sm"
                  placeholder="例：家族の用事、旅行など"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors text-sm"
                >
                  キャンセル
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={formDates.length === 0 || isSaving}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 text-white rounded-xl font-semibold transition-all text-sm"
                >
                  {isSaving ? '送信中...' : `申請する (${formDates.length}日)`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedLeave && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl p-5 w-full sm:max-w-md">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-bold text-indigo-600">申請詳細</h3>
              <button
                onClick={() => setSelectedLeave(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">希望日</label>
                <p className="text-gray-900 font-medium">
                  {new Date(selectedLeave.date).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">種類</label>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${leaveTypeColors[selectedLeave.leave_type]}`}>
                  {selectedLeave.leave_type}
                </span>
              </div>
              {selectedLeave.reason && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">理由</label>
                  <p className="text-gray-800 text-sm">{selectedLeave.reason}</p>
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">ステータス</label>
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${statusColors[selectedLeave.status].bg} ${statusColors[selectedLeave.status].border} border`}>
                  {React.createElement(statusColors[selectedLeave.status].icon, {
                    className: `w-4 h-4 ${statusColors[selectedLeave.status].text}`
                  })}
                  <span className={`text-sm font-medium ${statusColors[selectedLeave.status].text}`}>
                    {selectedLeave.status}
                  </span>
                </div>
              </div>
              {selectedLeave.rejection_reason && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">却下理由</label>
                  <p className="text-red-600 text-sm">{selectedLeave.rejection_reason}</p>
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">申請日</label>
                <p className="text-gray-600 text-sm">
                  {new Date(selectedLeave.created_at).toLocaleDateString('ja-JP')}
                </p>
              </div>

              {selectedLeave.status === REQUEST_STATUS.PENDING && (
                <div className="pt-3 border-t border-gray-200">
                  <button
                    onClick={() => handleDelete(selectedLeave.id)}
                    className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-colors text-sm flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    申請を取り消す
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

export default EmployeeLeaveRequest
